require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/discord')

const userSchema = new mongoose.Schema({
    user_id: Number,
    userTodo: [
        {isChecked: Boolean, idea: String}
    ]
})

userSchema.methods.show = function show(){
    var string = "";
    this.userTodo.forEach( todo => {
        var idea = todo.idea;

        if(todo.isChecked){
            var checked = "🗹";
        } else{
            var checked = "☐";
        }

        var phrase = checked + " | " + idea + "\n";

        string = string + phrase;
    }
    )

    return string;
}
const User = mongoose.model('User', userSchema);


const Discord = require('discord.js');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

});


client.login(process.env.CLIENT_TOKEN);

client.on('message', msg => {
    if(msg.author.bot) return;

    var string = msg.content;
    string = string.split(" ");

    if(string[0].toLowerCase() === 'ping'){
        msg.reply('Pong!');
    }

    else if(string[0].toLowerCase() === 'todolist' || string[0].toLowerCase() === 'todo'){
        const userId = msg.author.id;
        const functionality = string[1].toLowerCase();
        const additional = string[2] || null
        if(functionality === "create"){
            if(additional === null){
                msg.reply("To create a todolist, please use the following command: todolist create {todolist first todo}")
            } else {

                User.exists({user_id: userId}, (err, existence) => {
                    if(existence == null){
                        const user = new User({user_id: userId, userTodo: [{
                            isChecked: false, 
                            idea: additional
                        }]
                    })
                        user.save();
                        msg.reply("Todo list created! \n" + user.show());
                    } else {
                        msg.reply("Seems like you already have a todolist created, use todolist show to see it!")
                    }
                })
            }
        }
        
        else if(functionality === "show"){
            User.findOne({user_id: userId}, (err, user) => {
                if(user == null){
                    msg.reply("Sorry, seems like you didn't created a todolist yet, use todolist create {first todo name} to create one");
                } else {
                    msg.reply("Here is your todolist \n" + user.show())
                }
            })
        }
        
        else if(functionality === "add"){
            if(additional === null){
                msg.reply("To add a new todo to a todolist, please use the following command: todolist add {todo name}")
            } else{
            User.findOne({user_id: userId}, (err, user) => {
                if(user == null){
                    msg.reply("Sorry, seems like you didn't created a todolist yet, use todolist create {first todo name} to create one");
                } else {
                    var newTodo = {isChecked: false, idea: additional};
                    user.userTodo.push(newTodo);
                    user.save();

                    msg.reply("New todo successfully added! \n" + user.show());
                }
            }) 
        }
        }
        
        else if(functionality === "remove"){
            if(additional === null){
                msg.reply("To remove a todo from a todolist, please use the following command: todolist remove {todo name}")
            }
            User.findOne({user_id: userId}, (err, user) => {
                if(user == null){
                    msg.reply("Sorry, seems like you didn't created a todolist yet, use todolist create {first todo name} to create one");
                } else {
                    var filteredTodo = user.userTodo.filter(todo => {
                        return todo.idea.toLowerCase() != additional.toLowerCase();
                    })

                    user.userTodo = filteredTodo;
                    
                    user.save();
                    msg.reply("Todo successfully removed, updated Todo List: \n" + user.show());
                }
            })
        }

        else if(functionality === "check"){
            if(additional === null){
                msg.reply("To check a todo, please use the following command: todolist check {todo name}")
        }
        else{
            User.findOne({user_id: userId}, (err, user) => {
                if(user == null){
                    msg.reply("Sorry, seems like you didn't created a todolist yet, use todolist create {first todo name} to create one");
                } else {
                    user.userTodo.forEach(todo => {
                        if(todo.idea.toLowerCase() === additional.toLowerCase()){
                            todo.isChecked = true;
                            user.save();
                        }
                    })

                    msg.reply("Todo successfully updated! Updated Todo List: \n" + user.show())
                }
            })
        }
    }
    else if(functionality === "uncheck"){
        if(additional === null){
            msg.reply("To check a todo, please use the following command: todolist check {todo name}")
    }
    else{
        User.findOne({user_id: userId}, (err, user) => {
            if(user == null){
                msg.reply("Sorry, seems like you didn't created a todolist yet, use todolist create {first todo name} to create one");
            } else {
                user.userTodo.forEach(todo => {
                    if(todo.idea.toLowerCase() === additional.toLowerCase()){
                        todo.isChecked = false;
                        user.save();
                    }
                })

                msg.reply("Todo successfully updated! Updated Todo List: \n" + user.show())
            }
        })
    }
}
}
}
)