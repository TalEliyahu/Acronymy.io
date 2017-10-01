# Acronymy | Your personalized acronym's search engine

This is an application that will allow you to search the abbreviations of any acronym.

## Install NodeJS

Follow this tutorial and [install NodeJS](https://docs.npmjs.com/getting-started/installing-node) based on your operating system. You can check that Node is installed by writing these commands on console 
```node -v``` and ```npm -v```

## Install Angular CLI
Install Angular CLI package by following this command ```npm install -g @angular/cli```

## Install Http Server
Make sure you have installed http server e.g Apache and its running. You can test this by typing http://localhost:8080 in browser.

## Download Acronymy

Download the [Acronymy](https://github.com/Singapore-Tech-Entrepreneurs/acronymy) app and unzip it.

## Install NodeJS Packages

Move into the application directory and install NodeJS packages by running the command ```npm install```. 


## Build App

After install NodeJS packages you can build the app by this command ```ng build``` in the application directory. If you get any error make sure NodeJS and Angular-cli is properly installed.

After that run this command ```node server.js``` in application directory and then browser http://localhost:3000 in browser. You should see the application running.

## Personalizing Acronym Seach

You can use advance search to select/unselect the categories you want to be included in seach. You can also upload your json, csv, xlsx and zip files to be included in search. The file format should be as follows:

- Set the **Acronym** column name as **Key** (Case sensitive)
- Set the **Abbreviation** column name as **Abbreviation** (Case sensitive)
- Set the column name you want to show for detail as **Description** (Case sensitive)
