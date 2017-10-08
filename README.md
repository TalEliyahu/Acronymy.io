# Acronymy | Your personalized acronyms search engine

## Contributors 

Raheel Iftikhar 

## Install NodeJS

Follow this tutorial and [install NodeJS](https://docs.npmjs.com/getting-started/installing-node) based on your operating system. You can check that Node is installed by writing these commands on console 
```node -v``` and ```npm -v```

## Install Angular CLI
Install Angular CLI package by following this command ```npm install -g @angular/cli```

## Install Http Server
Make sure you have installed http server e.g Apache and its running. You can test this by typing http://localhost:8080 in browser.

-To [install apache on windows](https://www.sitepoint.com/how-to-install-apache-on-windows/) follow this tutorial
-To [install apache on linux](http://www.thatislinux.com/how-to-install-apache-webserver/) based operating system follow this tutorial

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


## Deployment

These are required to installed before starting the deployement process:
- NodeJS
- Webserver eg. Apache, Nginx
- Git Bash

###Step 1: Download Acronymy###
First thing is to clone or download the [acronymy](https://github.com/Singapore-Tech-Entrepreneurs/Acronymy) app to the desired folder. If you have download the app then unzip it in desired folder.

###Step 2: Install PM2 service###
Use npm to install PM2 service that is required to keep alive node server. To install PM2 use command
```sudo npm install -g pm2```

###Step 3: Configure Webserver (Apache)###
After downloading the app and installing PM2 service, next thing is to confiure webserver. Install the following modules ```proxy``` and ```proxy_http``` with these commands:

```sudo a2enmod proxy
sudo a2enmod proxy_http```

Once the installation is complete, restart Apache for the changes to take effect:

```sudo service apache2 restart```

Next, you will need to add the Apache proxy configurations. These directives need to be inserted into the VirtualHost command block in the site's main Apache configuration file.

By common convention, this Apache configuration file is usually /etc/apache2/sites-available/example.com.conf on Ubuntu.

Note: The location and filename of a site's Apache configuration file can vary.

Edit this file with your editor of choice, for example with the command:

```sudo nano /etc/apache2/sites-available/example.com.conf```

Scroll through the file until you find the VirtualHost command block, which will look like:

```<VirtualHost *:80>
ServerName example.com
    <Directory "/var/www/example.com/html">
    AllowOverride All
    </Directory>
</VirtualHost>```

Add the following to VirtualHost command block:

   ```ProxyRequests Off
   ProxyPreserveHost On
   ProxyVia Full
   <Proxy *>
      Require all granted
   </Proxy>

   <Location /nodejs>
      ProxyPass http://127.0.0.1:8080
      ProxyPassReverse http://1127.0.0.1:8080
   </Location>```

Be sure to put these lines outside any Directory command blocks. For example:

```<VirtualHost *:80>
	ServerName example.com

   ProxyRequests Off
   ProxyPreserveHost On
   ProxyVia Full
   <Proxy *>
      Require all granted
   </Proxy>

   <Location /nodejs>
      ProxyPass http://127.0.0.1:8080
      ProxyPassReverse http://127.0.0.1:8080
   </Location>

    <Directory "/var/www/example.com/html">
    AllowOverride All
    </Directory>
</VirtualHost>```

Save and exit the file, then restart Apache for the changes to take effect:

```sudo services apache2 restart```

After Apache restarts, you can test the application by viewing it in a browser. 


