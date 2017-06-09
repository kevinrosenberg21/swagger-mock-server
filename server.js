const
  swagger       = require('swagger-tools'),
  swaggerParser = require('swagger-parser'),
  faker         = require('faker/locale/es'),
  jsf           = require('json-schema-faker'),
  express       = require('express'),
  swaggerMerge = require('swagger-merge'),
  clone = require('git-clone');
//settear wagger-ui/#/test-controllerstatic files
  app           = express();
var config = require('./config/config');
app.use(express.static(config.build.static));
app.use(express.static(config.build.templates));
var files = [];

var rmdir = function(dir) {
    var path = require("path");
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};

function initializeSwaggerMiddleware(options, api) {
  swagger.initializeMiddleware(api, middleware => {
    const port = options.port || 9000;
    app.use(middleware.swaggerUi({ swaggerUi: '/swagger-ui' }));
    app.listen(port, '0.0.0.0');
    console.log(`Server http started successfully on port http://0.0.0.0:${port}`);
  });
}

function initializeEndpoints(api) {
  for (const path in api.paths) {
    const methods = api.paths[path];
    initializeMethods(methods, api.basePath == "/"? path : api.basePath+path);
  }
}

function initializeMethods(methods, path) {
  for (const method in methods) {
    const responses = methods[method].responses;
    const formattedPath = path.replace('{', ':').replace('}', '');
    app[method](formattedPath, (req, res) => {
      const schema = responses[200].schema;
      res.json(jsf(schema));
    });
  }
}

var fs = require('fs');

function readFiles(dirname, onError, callback) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        var promises = [];
        filenames.forEach(function(filename) {
            if (filename.toString().endsWith(".json")){
                promises.push(
                    swaggerParser.validate(dirname+filename)
                    .then(function (api) {
                        files.push(require(dirname+filename));
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
                );
            }
        });
        Promise.all(promises)
            .then(callback)
            .catch(console.error);
    });
}

function processFiles(options, callback){
    merged = swaggerMerge.merge(files, config.project.info, config.project.basePath, config.project.host, config.project.schemes);
    swaggerParser.dereference(merged).then(api => {
        initializeSwaggerMiddleware(options, api);
        initializeEndpoints(api);
    });
    callback();
}

module.exports = function start(repositoryPath, projectName, options) {
  clone(repositoryPath, __dirname + "/temp/"+projectName,function () {
     readFiles(__dirname +"/temp/"+projectName+"/",
         function(err){
            console.log(err)
         },
         function(){
             processFiles(options,function() {
                 rmdir(__dirname + "/temp/")
             });
         }
     )
  }
  );
};
