const broker = jest.createMockFromModule('./broker'); 

broker.publishMessage = jest.fn(() => { });

module.exports = broker;