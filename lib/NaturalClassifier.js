/**
 * Created by manthanhd on 01/11/2016.
 */
const util = require('util');
const TalkifyClassifier = require('talkify-classifier');

function NaturalClassifier(naturalClassifier) {
    this.getClassifications = function GetClassificationsFn(text, callback) {
        var err = undefined;
        var classifications = undefined;

        try {
            classifications = naturalClassifier.getClassifications(text);
        } catch (e) {
            classifications = [{label: undefined, value: undefined}];
            err = e;
        } finally {
            callback(err, classifications);
        }
    };

    this.initialize = function InitializeFn(callback) {
        naturalClassifier.train();
        return callback();
    };

    var _trainBatch = function(trainingDataArray, callback) {
        for(var i = 0; i < trainingDataArray.length; i++) {
            var trainingData = trainingDataArray[i];
            if(!trainingData.topic || !trainingData.text) return callback(new Error('Invalid training data. Training wholly aborted.'));
        }

        trainingDataArray.forEach(function(trainingData) {
            naturalClassifier.addDocument(trainingData.text, trainingData.topic);
        });

        return callback(undefined, true);
    };

    this.trainDocument = function TrainDocumentFn(trainingData, callback) {
        if(trainingData instanceof Array || trainingData.length) {
            return _trainBatch(trainingData, callback);
        }

        return _trainBatch([trainingData], callback);
    };
}

util.inherits(NaturalClassifier, TalkifyClassifier);

function LogisticRegressionClassifier() {
    const natural = require('natural');
    var lrClassifier = new natural.LogisticRegressionClassifier();
    return new NaturalClassifier(lrClassifier);
}

function BayesClassifier() {
    const natural = require('natural');
    var bClassifier = new natural.BayesClassifier();
    return new NaturalClassifier(bClassifier);
}

exports.LogisticRegressionClassifier = LogisticRegressionClassifier;
exports.BayesClassifier = BayesClassifier;