import { Injectable } from '@nestjs/common';

interface config {
    DB_CONNECTION:string,
    DB_NAME:string,
    ENV:string
}

@Injectable()
export class ConfigService { 
    public static  appConfig:config;
   constructor(){
    ConfigService.appConfig  = {
        DB_CONNECTION:process.env.DB ||  "mongodb://localhost:27017",
        DB_NAME:process.env.DB_NAME || "translation",
        ENV:process.env.ENV || "local"
    }
    console.log(' ConfigService.appConfig ', ConfigService.appConfig )
       
   }

   static getConfig():config {
    return this.appConfig
    }

    

}
