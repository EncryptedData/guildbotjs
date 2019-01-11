/**
 * guildbotjs
 * Discord Bot for D&D related things 
 * Author Russell Johnson
 * Copyright (C) Russell Johnson 2019
 * 
 */

 const Discord = require("discord.js");

 const client = new Discord.Client();

 /**
  * Handle when the client connects
  */
 client.on('ready', () => {
     console.log("==== guildbotjs ====");
     console.log("Bot logged in as ${client.user.tag}");
 });

 /**
  * Handle when people message the bot
  */
 client.on('message', msg => {

    // Don't listen to bots
    if(msg.author.bot)
    {
        return;
    }

    // Check if we should listen to 
    var shouldListen = false;
 });
