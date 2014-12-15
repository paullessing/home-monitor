home-monitor
============
This software, intended to be run on a <a href="http://raspberrypi.org">Raspberry Pi</a> attached to a standalone screen,
monitors the home WiFi on a <a href="http://www.dd-wrt.com/">DD-WRT</a> router.

Using the config, it maps MAC addresses to users and displays which users are currently at home
(based on the assumption that if their phone is connected to the WiFi, they are home).

When a user connects, the frontend greets them with a personalisable message.
