import os
import slack
import sys

client = slack.WebClient(token=os.environ['SLACK_USER_TOKEN'])

response = client.files_upload(
        channels='release_runs',
        title="Failed Cypress UI Test for review",
        file="/home/testrunner/cypress/videos/tito/titoactions.spec.js.mp4",
        thread_ts=os.environ['SLACK_THREAD'])
assert response["ok"]

sys.exit(-1)
