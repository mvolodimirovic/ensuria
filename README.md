# web-ensuria.ua

Developer environment
https://ensuria.simple-dev.site/

Sing In
url : https://ensuria.simple-dev.site/wp-admin/


If you need to migrate the website to production, do not use auto-replace in the SQL file. Follow these steps:

Export the files and the database as they are, without any modifications.

Import both into the production environment.

In the wp-config.php file, update the database name, username, and password to match the production environment.

In phpMyAdmin, find the wp_options table and update the values of the siteurl and home fields to match the production domain.

After that, log in to the WordPress admin panel, install the Better Search Replace plugin, and use it to replace the development domain with the production domain in all database tables.

Finally, go to Settings → Permalinks and click Save Changes to flush the rewrite rules.