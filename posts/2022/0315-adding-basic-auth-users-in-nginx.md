# Adding basic auth users in nginx



## Enable basic authentication

- install the httpasswd package
  ```
  yum install httpd24-tools
  ```
- If you create an user for the ***first time***, you have to create the password file using “-c <file>” option. Remember using “-c” option for the first time only.

  ```
  htpasswd -c /etc/nginx/kibana_htpasswd suraphart.suw
  ```

- Configure the site configuration to use basic authentication.
  ```
  server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name logs.weomni.com;
    rewrite ^/$ https://$host/_plugin/kibana redirect;
    
    location /_plugin/kibana {
    ...
    
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/kibana_htpasswd;
    }
    
    ...
  }
  ```

- Reload NGINX process.

  ```
  nginx -s reload
  ```

- Verify NGINX has started
  ```
  service nginx status
  ```

## Managing users on NGINX

- The users and their password are stored in this file `/etc/nginx/kibana_htpasswd` in this format:

  ```
  alice:$apr1$Q9qBLkLy$YQNxI8/GYuHLmoOUkbjN70
  bob:$apr1$5rz0Qz20$Xuo4c3yrZRjkAk89il7Us/
  ```
- The password is automatically encrypted before being stored in the file.

### Creating a new user

- Create a new user with the command below, enter the password when prompted:

  ```
  sudo htpasswd /etc/nginx/kibana_htpasswd john.doe
  ```

- All done. No reload is needed.
- To verify, use this command:

  ```
  cat /etc/nginx/kibana_htpasswd
  ```

### Changing password of an existing user

- Run the same command as when you create a user, enter the new password when prompted:

  ```
  sudo htpasswd /etc/nginx/kibana_htpasswd john.doe
  ```

### Deleting a user

- Run the command with option `-D`

  ```
  sudo htpasswd -D /etc/nginx/kibana_htpasswd john.doe
  ```