import simpleGit from 'simple-git';
import { consola, createConsola } from "consola";
import {COMMIT_TYPES} from "./constants.js";

const options = {
    baseDir: process.cwd(),
    binary: 'git',
}

const git = simpleGit(options);

export async function getBranchName(){
    try{
        const status = await git.status()
        consola.success('Current Branch : ' + status.current)
        return status.current;
    }catch(error){
        consola.error('Could not get current branch');
    }
}

export async function getDefaults(){
    const branch = await getBranchName();

    const match = branch.match(/^([a-zA-Z]+)\/(\d+)?-?(.+)?/);

    if(!match) {
        return {
            scope: '',
            id: ''
        }
    }

    const [ branchname, scope, id, title] = match;

    if (COMMIT_TYPES.includes(scope)) {
        return {
            branchname,
            scope,
            id: id || '',
            title: title || ''
        }
    }

    return {
        scope: '',
        id: ''
    }
}

export async function appendFiles(){
    try{
        await git.add(['.'])
    }catch (error) {
        consola.error(error);
    }
}

export async function commitMessage(message){
    try{
        await git.commit(message);
        consola.success(message);
    }catch (error){
        consola.error(error);
    }
}