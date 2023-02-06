import { net } from 'electron';
import * as fs from "fs";
import * as path from "path";

export function downloadFile(url: string, filepath: string){
    return new Promise<void>(async (resolve, reject) => {
        const request = net.request({
            method: "GET",
            url: url
        });
        await fs.promises.mkdir(path.dirname(filepath), {recursive: true});
        request.on('response', (response) => {
            const data: Buffer[] = [];
            
            response.on('data', (chunk) => {
                data.push(chunk);
            });
            response.on("end", async () => {
                await fs.promises.writeFile(filepath, data);
                resolve(undefined);
            });
            response.on("error", (error: Error) => {
                reject();
            });
            response.on("aborted", () => {
                reject();
            });
        });
        request.on('abort', () => {
            reject();
        });
        request.on('error', (error) => {
            reject();
        });
        request.end();
    });
}

export interface RequestResponse{
    text: string;
    ok: boolean;
    statusCode: number;
    error?: Error;
}

export function request(url: string){
    return new Promise<RequestResponse>((resolve, reject) => {
        const request = net.request({
            method: "GET",
            url: url
        });
        const data: Buffer[] = [];
        let responseData: RequestResponse = {
            text: "",
            ok: true,
            statusCode: 0
        };
        request.on('response', (response) => {
            responseData.statusCode = response.statusCode;
     
            response.on('data', (chunk) => {
                data.push(chunk);
            });
            response.on("end", () => {
                responseData.text = Buffer.concat(data).toString();
                resolve(responseData);
            });
            response.on("error", (error: Error) => {
                responseData.ok = false;
                responseData.error = error;
                resolve(responseData);
            });
            response.on("aborted", () => {
                responseData.ok = false;
                resolve(responseData);
            });
        });
        request.on('abort', () => {
            responseData.ok = false;
            resolve(responseData);
        });
        request.on('error', (error) => {
            responseData.ok = false;
            responseData.error = error;
            resolve(responseData);
        });
        request.end();
    });
}