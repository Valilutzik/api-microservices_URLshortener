var express = require("express");
var isUrl = require("nice-is-url");
var path = require("path");
var MongoClient = require("mongodb").MongoClient;
var http = require("http");
var shortid = require("shortid");
var compareUrls = require("compare-urls");
var dotenv = require("dotenv");

var app = express();
dotenv.config();

var url = process.env.MONGOLAB_URI;
var port = process.env.PORT || 8080;

app.get(["/:name", "/http://:name", "/https://:name"], function(req, res)
    {
        
        var name = req.params.name;
        console.log(name);
            MongoClient.connect(url, function(err, db)
            {
                if (err) throw err;
                
                if (isUrl(name)) 
                {        
                    db.collection("mydb").find().toArray(function(err, result) {        
                                
                                if (err) throw err;
 
                                if (result.length==0) 
                                {
                                        var random_ = shortid.generate();
                                        db.collection("mydb").insert({"longUrl":name, "shortUrl":random_}); 
                                        res.json({"shortUrl":random_}); 
                                }
                                else {
                                    for (var i=0; i<result.length; i++) 
                                    {
                                        var tracker_ = false;
                                        if (compareUrls(name, result[i].longUrl)==true) {tracker_ = true; var duplicateShortUrl = result[i].shortUrl};             
                                    }

                                    if (tracker_==true) 
                                    {
                                      res.json({"Error":"URL already existing", "shortUrl":duplicateShortUrl});
                                    } else {
                                      var random_ = shortid.generate();
                                      db.collection("mydb").insert({"longUrl":name, "shortUrl":random_});
                                      res.json({"shortUrl":random_});
                                    };
                                }
                    });
                } else 
                    {   
                        db.collection("mydb").find({"shortUrl":name}).toArray(function(err, result)
                                    {
                                        if (err) throw error;
                                        if (result.length>0) 
                                            {
                                                res.json({"longUrl":result.longUrl}); 
                                            }
                                            else {
                                                res.json({"Error":"Malformed query, please try again"});
                                            }
                                    });
                    };
            });
    });

app.get("/", function(req, res)
    {
        res.end("<div style='text-align:center;'><h1 style='text-center;'>Welcome to the URL Shortner!</h1><br/><div>Enter a URL after the / in the URL Tab (example: https://cryptic-tor-97079.herokuapp.com/google.com)</div></div>")
    });

http.createServer(app).listen(port);    