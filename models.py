import json

class Channel(object):

    def __init__(self, name):
        self.name = name  # Name of the channel
        self.members = []  # A list to keep track of the memebers
        self.messages = []  # A list to keep track of the messages (100 latest messages)
    
    
    def get_name(self):
        return self.name

    def to_json(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

    def add_message(self, message):
        if(len(self.messages) <= 100):
            self.messages.append(message)
        else:
            self.messages = self.messages[1:]
            self.messages.append(message)


class message(object):

    def __init__(self, text, sent_by, timestamp):
        self.text = text
        self.sent_by = sent_by
        self.timestamp = timestamp
    
    def to_json(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)