/**
 * Created by manthanhd on 01/11/2016.
 */

const expect = require('expect');
const mockery = require('mockery');

describe('LogisticRegressionClassifier', function () {

    beforeEach(function (done) {
        mockery.enable({warnOnUnregistered: false, warnOnReplace: false});
        done();
    });

    afterEach(function (done) {
        mockery.deregisterAll();
        mockery.disable();
        done();
    });

    describe('initialize', function() {
        it('calls train on underlying classifier', function(done) {
            var mockClassifier = {train: expect.createSpy().andCallThrough()};
            var mockNatural = {
                LogisticRegressionClassifier: function() {return mockClassifier}
            };

            mockery.registerMock('natural', mockNatural);
            const LogisticRegressionClassifier = require('../lib/NaturalClassifier').LogisticRegressionClassifier;
            new LogisticRegressionClassifier().initialize(function() {
                expect(mockClassifier.train).toHaveBeenCalled();
                return done();
            });
        });
    });

    describe('trainDocument', function () {
        it('trains given document', function (done) {
            var mockClassifier = {addDocument: expect.createSpy().andCallThrough()};
            var mockNatural = {
                LogisticRegressionClassifier: function() {return mockClassifier}
            };

            mockery.registerMock('natural', mockNatural);
            const LogisticRegressionClassifier = require('../lib/NaturalClassifier').LogisticRegressionClassifier;
            new LogisticRegressionClassifier().trainDocument({
                topic: 'hello',
                text: 'how is it going?'
            }, function (err, isDone) {
                if (err) {
                    return done(err);
                }

                expect(isDone).toBe(true);
                expect(mockClassifier.addDocument).toHaveBeenCalled();
                return done();
            });
        });

        it('returns error in callback when training data is not valid', function(done) {
            var mockClassifier = {addDocument: expect.createSpy().andCallThrough()};
            var mockNatural = {
                LogisticRegressionClassifier: function() {return mockClassifier}
            };

            mockery.registerMock('natural', mockNatural);

            const LogisticRegressionClassifier = require('../lib/NaturalClassifier').LogisticRegressionClassifier;
            new LogisticRegressionClassifier().trainDocument({}, function (err, isDone) {
                expect(err).toExist();
                expect(err.message).toBe('Invalid training data. Training wholly aborted.');

                expect(isDone).toNotExist();

                expect(mockClassifier.addDocument).toNotHaveBeenCalled();
                return done();
            });
        });

        it('trains array of documents', function(done) {
            var mockClassifier = {addDocument: expect.createSpy().andCallThrough()};
            var mockNatural = {
                LogisticRegressionClassifier: function() {return mockClassifier}
            };

            mockery.registerMock('natural', mockNatural);
            const LogisticRegressionClassifier = require('../lib/NaturalClassifier').LogisticRegressionClassifier;
            new LogisticRegressionClassifier().trainDocument([
                {
                    topic: 'hello',
                    text: 'how is it going?'
                },
                {
                    topic: 'hi',
                    text: 'hey there'
                }
            ], function (err, isDone) {
                if (err) {
                    return done(err);
                }

                expect(isDone).toBe(true);
                expect(mockClassifier.addDocument).toHaveBeenCalled();
                expect(mockClassifier.addDocument.calls.length).toBe(2);
                return done();
            });
        });

        it('returns error in callback when one of the items in training data array is not valid', function(done) {
            var mockClassifier = {addDocument: expect.createSpy().andCallThrough()};
            var mockNatural = {
                LogisticRegressionClassifier: function() {return mockClassifier}
            };

            mockery.registerMock('natural', mockNatural);

            const LogisticRegressionClassifier = require('../lib/NaturalClassifier').LogisticRegressionClassifier;
            new LogisticRegressionClassifier().trainDocument([{}], function (err, isDone) {
                expect(err).toExist();
                expect(err.message).toBe('Invalid training data. Training wholly aborted.');

                expect(isDone).toNotExist();

                expect(mockClassifier.addDocument).toNotHaveBeenCalled();
                return done();
            });
        });
    });

    describe('getClassifications', function(){
        it('gets classifications from underlying natural classifier', function(done) {
            var mockClassifier = {
                getClassifications: expect.createSpy().andCall(function(input) {
                    expect(input).toBe('something');
                    return [{label: 'hello', value: 0.56}];
                })
            };
            expect.spyOn(mockClassifier, 'getClassifications');
            var mockNatural = {
                LogisticRegressionClassifier: function() {return mockClassifier}
            };

            mockery.registerMock('natural', mockNatural);

            const LogisticRegressionClassifier = require('../lib/NaturalClassifier').LogisticRegressionClassifier;
            new LogisticRegressionClassifier().getClassifications('something', function(err, classifications) {
                expect(err).toNotExist();

                expect(classifications).toExist();
                expect(classifications[0].label).toBe('hello');
                expect(classifications[0].value).toBe(0.56);
                expect(mockClassifier.getClassifications).toHaveBeenCalled();
                return done();
            });
        });

        it('handles error when classifier throws errors on getClassifications', function(done) {
            var mockClassifier = {
                getClassifications: expect.createSpy().andCall(function(input) {
                    expect(input).toBe('something');
                    throw new TypeError('error yo');
                })
            };
            expect.spyOn(mockClassifier, 'getClassifications');
            var mockNatural = {
                LogisticRegressionClassifier: function() {return mockClassifier}
            };

            mockery.registerMock('natural', mockNatural);

            const LogisticRegressionClassifier = require('../lib/NaturalClassifier').LogisticRegressionClassifier;
            new LogisticRegressionClassifier().getClassifications('something', function(err, classifications) {
                expect(err).toExist();
                expect(err).toBeA(TypeError);
                expect(err.message).toBe('error yo');

                expect(classifications).toExist();
                expect(classifications[0].label).toBe(undefined);
                expect(classifications[0].value).toBe(undefined);
                expect(mockClassifier.getClassifications).toHaveBeenCalled();
                return done();
            });
        });
    })
});