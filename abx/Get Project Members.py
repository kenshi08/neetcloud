from botocore.vendored import requests
import json

def handler(context, inputs):
        
    baseUri = inputs['baseUri']
    casToken = inputs['casToken']
    url = baseUri + "/iaas/login"
    headers = {"Accept":"application/json","Content-Type":"application/json"}
    payload = {"refreshToken":casToken}

    results = requests.post(url,json=payload,headers=headers)
    print(results.json()["token"])
    bearer = "Bearer "
    bearer = bearer + results.json()["token"]
    
    casURI = baseUri + "/iaas/api/projects"
    print(casURI)
    headers = {"Accept":"application/json","Content-Type":"application/json", "Authorization":bearer }

    results = requests.get(casURI, headers=headers)
    print(results.json()['content'])
    
    projects = results.json()['content']
    print(projects)
    projectInfo = [];
    
    for project in projects:
        print(project)
        projMember = {
            "id": project['id'],
            "name": project['name'],
            "members": project['members']
                
        }
        projectInfo.append(projMember)
    
    outputs = {
        "projects": projectInfo
    }
    return outputs