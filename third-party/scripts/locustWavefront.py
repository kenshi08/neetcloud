from locust import HttpLocust, TaskSet, task
from locust.wait_time import between
import resource
import locust.events
import time
import socket
import atexit
import os
import gevent

resource.setrlimit(resource.RLIMIT_NOFILE, (999999, 999999))

# Wavefront metric format
# <metricName> <metricValue> [<timestamp>] source=<source> [pointTags]
# Note: This python script assumes the environemnt variable WAVEFRONT_PROXY has been set prior to execution

class Tito(TaskSet):
    @task
    def open_index_page(self):
        self.client.get("/Tito/")

class MyLocust(HttpLocust):
    task_set = Tito
    sock = None
    wait_time = between(5, 15)

    def __init__(self):
        super(MyLocust, self).__init__()
        self.sock = socket.socket()
        wavefrontProxy = os.environ.get("WAVEFRONT_PROXY")
        self.sock.connect( (wavefrontProxy, 2878) )
        locust.events.request_success += self.hook_request_success
        locust.events.request_failure += self.hook_request_fail
        atexit.register(self.exit_handler)

    def hook_request_success(self, request_type, name, response_time, response_length):
        myHost = self.host
        myHost = myHost.replace("http://","")
        met_locustRequest = 'locust.response.success' + ' ' + str(response_time) + ' ' + str(time.time()) + ' ' + 'source=' + myHost + ' ' + 'app=Tito' + ' \n'
        try:
            self.sock.sendall(met_locustRequest.encode('utf-8'))
        except BrokenPipeError:
            # Don't be surprised if the socket is in "not
            # connected" state.
            #print(met_locustRequest)
            pass
        
        #print(met_locustRequest)

    def hook_request_fail(self, request_type, name, response_time, exception):
        myHost = self.host
        myHost = myHost.replace("http://","")
        met_locustRequestFailed = 'locust.response.failed' + ' ' + str(response_time) + ' ' + str(time.time()) + ' ' + 'source=' + myHost + ' ' + 'app=Tito' + ' \n'
        try:
            self.sock.sendall(met_locustRequestFailed.encode('utf-8'))
        except BrokenPipeError:
            # Don't be surprised if the socket is in "not
            # connected" state.
            #print(met_locustRequestFailed)
            pass
        #print(met_locustRequestFailed)

    def exit_handler(self):
        try:
            self.sock.shutdown(socket.SHUT_RDWR)
            self.sock.close()
        except IOError:
            # Don't be surprised if the socket is in "not
            # connected" state.
            pass
        else:
            self.sock.close()