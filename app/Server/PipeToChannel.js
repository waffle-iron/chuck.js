define([
	"Lib/Utilities/NotificationCenter",
	"child_process"
],

function (Nc, childProcess) {

	var fork = childProcess.fork;

	function PipeToChannel (options) {

		this.fork = null;

		try {
            this.fork = fork('channel.js');
        } catch (err) {
            throw 'Failed to fork channel! (' + err + ')';
        }

        console.checkpoint('creating channel process for ' + options.channelName);

        this.send('channel/' + options.channelName, { CREATE: true, options: options });

        this.fork.on('message', this.onMessage.bind(this));

        var self = this;
	}

	// While creating user
	PipeToChannel.prototype.send = function (recipient, data) {
        var message = {
            recipient: recipient,
            data: data
        }

		this.fork.send(message);
	}

	// If user already created
	PipeToChannel.prototype.sendToUser = function (id, data) {
        var message = {
            recipient: "user/" + id,
            data: data
        }
		
		this.fork.send(message);
	}

	PipeToChannel.prototype.onMessage = function (message) {
		Nc.trigger(message.recipient + '/message', message.data);
	}

	return PipeToChannel;

});