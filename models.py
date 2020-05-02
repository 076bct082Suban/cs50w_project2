import json

class Channel:

    def __init__(self, name):
        self.name = name  # Name of the channel
        self.members = []  # A list to keep track of the memebers
        self.messages = []  # A list to keep track of the messages (100 latest messages)
    
    
    def get_name(self):
        return self.name

    def to_json(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)