# Production & Deployment

There are multiple ways of deploying this application, please go through the following steps.

1. Set up the loklak_server with the required settings to render via the settings api.
2. Clone the stable tip `git clone https://github.com/loklak/loklak_webclient`
3. `cd loklak_webclient`
4. Set up all the required dependencies using `npm install` in `iframely` , `oauth-proxy` and `loklak_webclient` folders.
5. `gulp prod`

That should get your basic application successfully setup and ready for deployment.

### Using screen sessions

1. `screen -S iframely`
2. In the screen service do `cd iframely`, `node server.js`
3. `cd ..`
4. Detach from screen `^A^D`
5. `screen -S production`
6. `node oauth-proxy/index.js` or `gulp live`
7. Detach from screen `^A^D`

### Deployment 
1. The iframely and oauth-proxy processes should be running forever with pm2. Check if they are running or not by "pm2 list". If they are running or do not need to be updated, skip to step 5.
2. If those processes need to be updated, you need to stop them first by "pm2 stop ". You can get the pm2-id by doing "pm2 list"
3. Start oauth-proxy by "pm2 start oauth-proxy/index.js"
4. Start iframley by "cd iframely" and "pm2 start server.js". Do remember to go back to the root directory.
5. "git pull"
6. "gulp prod"

If you have your own web server engine, you can use the `build/` created by gulp prod to serve the created file statically but then make sure that the oauth proxy is running the service at the `oauthProxyPort`

When there is a need to change default port `oauthProxyUrl, oauthProxyRedirectUrl, oauthProxyPort` should have the same port. The port to the application can be change at `gulpDevExpressPort`
