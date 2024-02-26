const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const mongoose = require('mongoose');
const axios = require('axios');
const express = require('express');
const dotenv = require('dotenv')

const User = require('./model/user');
const adminRoutes = require('./routes/admin')

const app = express();

dotenv.config();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(adminRoutes);

const bot = new TelegramBot(process.env.token, { polling: true });

mongoose.connect(process.env.Mongo_URL).then((res)=>{
  console.log("connected");
  app.listen(3000);
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userExists = await User.findOne({ telegramId: chatId });

  if (userExists) {
    bot.sendMessage(chatId, 'Welcome back!');
    getWeatherUpdate(chatId).then().catch((err)=>{console.log(err)})
  } else {
    bot.sendMessage(chatId, 'Hi! I need some information to provide weather updates.\nPlease tell me your name:');
    bot.once('text', async (nameMsg) => {
      const name = nameMsg.text;

      bot.sendMessage(chatId, 'Great! Now, tell me your city:');
      bot.once('text', async (cityMsg) => {
        const city = cityMsg.text;

        bot.sendMessage(chatId, 'Got it! Finally, tell me your country:');
        bot.once('text', async (countryMsg) => {
          const country = countryMsg.text;

          const newUser = new User({
            telegramId: chatId,
            name,
            city,
            country,
          });

          await newUser.save();
          bot.sendMessage(chatId,'Thank you! You are now registered.You will receive daily weather updates.\n to recieve weather update after register type /start');
        });
      });
    });
  }
});

async function getWeatherUpdate(chatId){
  const userInput = await User.findOne({ telegramId: chatId });
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${userInput.city}&appid=ea05f0b6617d998492f421c4335d3bba`
      );
      const data = response.data;
      const weather = data.weather[0].description;
      const temperature = data.main.temp - 273.15;
      const city = data.name;
      const humidity = data.main.humidity;
      const pressure = data.main.pressure;
      const windSpeed = data.wind.speed;
      const message = `The current conditions in ${city} report ${weather}, featuring a temperature of ${temperature.toFixed(2)}°C. Humidity stands at ${humidity}%, atmospheric pressure registers ${pressure}hPa, and the wind speed clocks in at ${windSpeed}m/s`;
      bot.sendMessage(chatId, message);
}

cron.schedule('0 0 * * *', async () => {
  const users = await User.find();
  
  users.forEach(async (user) => {
    try {
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${user.city}&appid=ea05f0b6617d998492f421c4335d3bba`);
      const weatherData = weatherResponse.data; 
      bot.sendMessage(
        user.telegramId,
        `Good morning, ${user.name}!\nHere's the weather update for ${user.city}, ${user.country}:\n${weatherData}`
      );
    } catch (error) {
      console.error('Error fetching weather data:', error.message);
    }
  });
});







