// Documentation of the server
// https://webpack.js.org/configuration/dev-server/#devserver-setup
'use strict'
const fs = require('fs')
const path = require('path')
const utils = require('./utils')
var bodyParser = require('body-parser')

const virtual_state_data = path.join(__dirname, '/devstorage/state.json');
const virtual_ap_list_data = path.join(__dirname, '/devstorage/ap_list.json');

module.exports = function(app){
    app.use(bodyParser.json());

    let getActualState = function(){

        try {
            let state = JSON.parse(fs.readFileSync(virtual_state_data));

            //Time
            state.time    = {
                //Emulation current time of controller
                current : (new Date).getTime() - (state.time.delta ? state.time.delta : 0),
                offset : state.time.offset
            };

            //Access point list
            try {
                state.net.ap_list   = JSON.parse(fs.readFileSync(virtual_ap_list_data));
            }catch (e){
                console.warn("Can not load ap_list.json file. ap_list will be empty");
                state.net.ap_list   = [];
            }

            return state;
        } catch (e){
            console.log('No found state.json file', e);
            return null;
        }
    };

    app.get('/api/profile', function(req, res) {
        console.log('>Get profile data ');
        res.json(require(path.resolve(__dirname, "../static/profile.json")));
    });

    app.get('/api/state', function(req, res) {
        console.log('>Get state data ');
        fs.readFile(virtual_state_data, (err, result) => {

            if (err) {
                console.log(err);
                res.send(404, 'Error of open state.json file');
            } else {

                let response = getActualState();

                if(!response)
                    res.send(500, "Can not read state.json file")
                else
                    res.json(getActualState());
            }
        });
    });

    app.get('/api/rescan_net', function(req, res) {
        console.log('>Get available access points list');
        fs.readFile(virtual_state_data, (err, result) => {
            if (err) {
                res.send(404, 'Error of open state.json file');
            } else
                res.json(JSON.parse(result).net.ap_list);
        });
    });

    app.get('/api/time', function(req, res) {
        console.log('>Get datetime');
        res.send(200, (new Date).getTime() - (new Date).getTimezoneOffset() * 60000);
    });

    app.put('/api/config', function(req, res) {
        try {
            let origin = getActualState();

            let state = Object.assign({}, origin);

            if('net' in req.body)
                state.net       =  Object.assign(state.net, req.body.net);
            if('display' in req.body)
                state.display   =  Object.assign(state.display, req.body.display);
            if('time' in req.body)
                state.time      =  Object.assign(state.time, req.body.time);

            state.net.ap_list   = origin.net.ap_list;

            if('time' in state){
                state.time.delta    = (new Date).getTime() - state.time.current;
            }

            fs.writeFileSync(virtual_state_data, JSON.stringify(state));

            res.json(state);
        } catch (e) {
            console.log('Error write state.json file', e);
            res.send(500);
        }
    });

    app.put('/api/netconfig', function(req, res) {

        console.log('> Post store data: ', req.files.file.data.toString('ascii'));
        req.files.file.mv(virtual_state_data);
        res.status(200);
        res.end();

    });
}