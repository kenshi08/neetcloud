from botocore.vendored import requests
import json

def handler(context, inputs):
    
    for projectId in inputs['projectIds']:
        
        baseUri = inputs['baseUri']
        casToken = inputs['casToken']
        url = baseUri + "/iaas/login"
        headers = {"Accept":"application/json","Content-Type":"application/json"}
        payload = {"refreshToken":casToken}

        results = requests.post(url,json=payload,headers=headers)
        print(results.json()["token"])
        bearer = "Bearer "
        bearer = bearer + results.json()["token"]
    
        casURI = baseUri + "/content/api/sources"
        print(casURI)
        headers = {"Accept":"application/json","Content-Type":"application/json", "Authorization":bearer }
    
        payload =   {
                        "name": inputs['name'],
                        "typeId": inputs['typeId'],
                        "type": inputs['type'],
                        "projectId": projectId,
                        "config":inputs['configBlueprint'],
                        "syncEnabled": inputs['syncEnabled']
                    }
        results = requests.post(casURI,json=payload, headers=headers)
        print(results.json())
    
    outputs = {}
    outputs = {
    }
    return outputs