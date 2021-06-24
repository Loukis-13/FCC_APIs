const mongoose = require('mongoose');
const express = require('express');

mongoose.connect(process.env['DB_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true
    },
    log: [],
}, {versionKey: false});

const exercisesSchema = new mongoose.Schema({
    _id: {
        type: mongoose.ObjectId,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        min: [1, "duration too short"],
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
}, {versionKey: false, _id : false});

let User = mongoose.model('User', userSchema);
let Exercise = mongoose.model('Exercise', exercisesSchema);

module.exports = function(app, apiRoot) {
    const core = apiRoot + "/exercise-tracker";

    app.use('/public', express.static(process.cwd() + '/Exercise_Tracker/public'));
	app.get(core, function (req, res) {
		res.sendFile(process.cwd() + '/Exercise_Tracker/views/index.html');
	});

    app.post(core + '/users', (req, res)=>{
        User.exists({username: req.body.username}).then( (exist)=>{
            if (exist) return res.send("Username already taken");
        
            User.create(req.body, (err, user)=>{
                if(err) return res.send(err.errors.username.message);
                res.json({username: user.username, _id: user._id});
            });
        });
    });
      
    app.post(core + '/users/:_id/exercises', (req, res)=>{
        delete req.body[':_id']
        Object.assign(req.body, req.params)
        if (!req.body.date) req.body.date = undefined
        
        let exercise = Exercise(req.body)
        error = exercise.validateSync();
        if (error) return res.send(Object.values(error.errors).map(val => val.message)[0])
        
        User.findById(req.body._id, (err, user)=>{
            if (!user) return res.send("Unknown userId");
        
            x = {...exercise._doc}
            delete x._id
            user.log.push(x);
            user.save().then(()=>res.json({
                _id: user._id,
                username: user.username,
                description: exercise.description,
                duration: exercise.duration,
                date: exercise.date.toDateString()
            }));
        });
    })
      
    app.get(core + '/users', (req,res)=>{
        User.find({}, '_id username', (err, data)=>res.json(data))
    })
      
    app.get(core + '/users/:_id/logs', (req, res)=>{
        let _from = new Date(req.query.from)
        let to = new Date(req.query.to)
        let limit = Number(req.query.limit)?Math.abs(Number(req.query.limit)):NaN;
    
        User.findById(req.params._id, (err, user)=>{
            if (err) return console.log(err);
            if (!user) return  res.send('Unknown userId')
        }).exec( (err, user)=>{
            if (_from != 'Invalid Date') user.log = user.log.filter(obj=>obj.date>=_from)
            if (to != 'Invalid Date') user.log = user.log.filter(obj=>obj.date<=to)
            if (limit) user.log = user.log.slice(0, limit)
        
            user._doc.count = user.log.length;
            for (i in user.log) user.log[i].date = user.log[i].date.toDateString()
            res.json(user);
        })
    })
}
