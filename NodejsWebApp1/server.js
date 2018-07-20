'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var querystring = require('querystring');

http.createServer(function (browserRequest, browserResponse) {
    //Set the content type header of the response sent to the browser
    browserResponse.writeHead(200, {
        'Content-Type': 'text/html'
    });


    //Processing POST requests
    var queryData = "";
    var movieName = "";
    console.log('Browser request method' + browserRequest.method);
    if (browserRequest.method == 'POST') {
        console.log('Inside the post block');
        browserRequest.on('data', function (data) {
            queryData += data;
            if (queryData.length > 1e6) {
                queryData = "";
                browserResponse.writeHead(413, { 'Content-Type': 'text/plain' }).end();
                browserResponse.connection.destroy();
            }
        });

        browserRequest.on('end', function () {
            var post = querystring.parse(queryData);
            console.log(post);                 
            console.log(post.movieName);
            movieName = post.movieName;
            movieName = encodeURIComponent(movieName);

            //Display page
            var pathStart = '/?t=';
            var pathEnd = '&plot=short&r=jsongraph.facebook.com';
            var complePath = pathStart + movieName + pathEnd;
            console.log('Complete path');
            console.log(complePath);
            var optionsget = {
                host: 'www.omdbapi.com', // here only the domain name
                // (no http/https !)        
                path: complePath,
                method: 'GET' // do GET
            };
            
            var serverRequest = http.request(optionsget, function (serverResponse) {
                serverResponse.on('data', function (chunk) {
                    process.stdout.write(chunk);
                    var output = chunk.toString('utf8');
                    var parse = JSON.parse(output);
                    if (parse.Response.toString() == "False") {
                        //handle zero result case
                        console.log("Inside the false block");
                        console.log(parse.Error.toString());
                        if (parse.Error.toString() == "Movie not found!") {
                            outputHTML = "Whoa, that's strange! We couldn't find that movie on our data base!<br/><br/>Enter another movie name and try again!<br/><form method=\"post\">Movie name:<br><input type=\"text\" name=\"movieName\"><br><br><input type=\"submit\" value=\"Submit\"></form>";
                        }
                        //handle default error case
                        else {
                            outputHTML = "Welcome to movie search portal!!<br/><br/><form method=\"post\">Movie name:<br><input type=\"text\" name=\"movieName\"><br><br><input type=\"submit\" value=\"Submit\"></form>";
                        }
                    }
                    //When the movie is found
                    else if (parse.Response.toString() == "True") {
                        var outputHTML = "<form method=\"get\"><input type=\"submit\" value=\"Back\"/></form><div><img src=" + parse.Poster + "/><table><tr><td>Title&nbsp;</td><td>" + parse.Title + "</td></tr><tr><td>Year of Release&nbsp;</td><td>" + parse.Year + "</td></tr><tr><td>Date of release&nbsp;</td><td>" + parse.Released + "</td></tr><tr><td>Rated&nbsp;</td><td>" + parse.Rated + "</td></tr><tr><td>Run Time&nbsp;</td><td>" + parse.Runtime + "</td></tr><tr><td>Genre&nbsp;</td><td>" + parse.Genre + "</td></tr><tr><td>Director&nbsp;</td><td>" + parse.Director + "</td></tr><tr><td>Writer&nbsp;</td><td>" + parse.Writer + "</td></tr><tr><td>Actors&nbsp;</td><td>" + parse.Actors + "</td></tr><tr><td>Plot&nbsp;</td><td><p>" + parse.Plot + "</p></td></tr><tr><td>Language&nbsp;</td><td><p>" + parse.Language + "</p></td></tr><tr><td>Country&nbsp;</td><td><p>" + parse.Country + "</p></td></tr><tr><td>Awards&nbsp;</td><td><p>" + parse.Awards + "</p></td></tr><tr><td>Metascore&nbsp;</td><td><p>" + parse.Metascore + "</p></td></tr><tr><td>IMDB Rating&nbsp;</td><td>" + parse.imdbRating + "</td></tr><tr><td>Number of Votes&nbsp;</td><td>" + parse.imdbVotes + "</td></tr><tr><td>DVD Release Date&nbsp;</td><td>" + parse.DVD + "</td></tr><tr><td>Box Office&nbsp;</td><td>" + parse.BoxOffice + "</td></tr><tr><td>Production&nbsp;</td><td>" + parse.Production + "</td></tr><tr><td>Website&nbsp;</td><td>" + parse.Website + "</td></tr></table></div>";
                        outputHTML = outputHTML + "<br/>";
                    }
                    //First page load use case
                    else {
                        outputHTML = "Welcome to movie search portal!!<br/><form method=\"post\">Movie name:<br><input type=\"text\" name=\"movieName\"><br><br><input type=\"submit\" value=\"Submit\"></form>";
                    }
                    browserResponse.write(outputHTML);
                });

                serverResponse.on('end', function () {
                    // Closing browser response
                    browserResponse.end();
                });
            });

            serverRequest.on('error', function (e) {
                //console.log('problem with request: ' + e.message);
            });
            serverRequest.end();
        });

    }
    else
    {
        var outputHTML = "Welcome to movie search portal!!<br/><form method=\"post\">Movie name:<br><input type=\"text\" name=\"movieName\"><br><br><input type=\"submit\" value=\"Submit\"></form>";
        browserResponse.write(outputHTML);
        browserResponse.end();
    }
}).listen(1337);
