from botocore.vendored import requests
import json

def handler(context, inputs):

    def invite(header,
               id,
               usernames,
               org_role='org_member',
               cloud_assembly=False,
               code_stream=False,
               service_broker=False,
               log_intelligence=False,
               network_insight=False
               ):
        baseurl = 'https://console.cloud.vmware.com'
        uri = f'/csp/gateway/am/api/orgs/{id}/invitations'
        payload = {
            'usernames': usernames,
            'orgRoleName': org_role,
            'serviceRolesDtos': []
        }
        if cloud_assembly:
            payload['serviceRolesDtos'].append({
                'serviceDefinitionLink': ('/csp/gateway/slc/api/definitions'
                                          '/external'
                                          '/Zy924mE3dwn2ASyVZR0Nn7lupeA_'
                                          ),
                'serviceRoleNames':
                    [
                        'automationservice:user',
                        'automationservice:cloud_admin'
                    ]
            })

        if code_stream:
            payload['serviceRolesDtos'].append({
                'serviceDefinitionLink': ('/csp/gateway/slc/api/definitions'
                                          '/external'
                                          '/ulvqtN4141beCT2oOnbj-wlkzGg_'
                                          ),
                'serviceRoleNames':
                    [
                        'CodeStream:administrator',
                        'CodeStream:viewer',
                        'CodeStream:developer'
                    ]
            })

        if service_broker:
            payload['serviceRolesDtos'].append({
                'serviceDefinitionLink': ('/csp/gateway/slc/api/definitions'
                                          '/external'
                                          '/Yw-HyBeQzjCXkL2wQSeGwauJ-mA_'
                                          ),
                'serviceRoleNames':
                [
                    'catalog:admin',
                    'catalog:user'
                ]
            })

        if log_intelligence:
            payload['serviceRolesDtos'].append({
                'serviceDefinitionLink': ('/csp/gateway/slc/api/definitions'
                                          '/external'
                                          '/7cJ2ngS_hRCY_bIbWucM4KWQwOo_'
                                          ),
                'serviceRoleNames':
                    [
                        'log-intelligence:admin',
                        'log-intelligence:user'
                    ]
            })

        if network_insight:
            payload['serviceRolesDtos'].append({
                'serviceDefinitionLink': ('/csp/gateway/slc/api/definitions'
                                          '/external'
                                          '/9qjoNafDp9XkyyQLcLCKWPsAir0_'
                                          ),
                'serviceRoleNames':
                    [
                        'vrni:admin',
                        'vrni:user'
                    ]
            })
        url = baseurl + uri
        print(url)
        print(payload)
        return requests.post(url,json=payload,headers=header)
    
    
    baseUri = inputs['baseUri']
    casToken = inputs['casToken']
    
    url = baseUri + "/csp/gateway/am/api/auth/api-tokens/authorize?refresh_token=" + casToken
    headers = {"Accept":"application/json","Content-Type":"application/json"}
    payload = {}

    results = requests.post(url,json=payload,headers=headers)
    
    print(results.json()["access_token"])
    bearer = "Bearer "
    bearer = bearer + results.json()["access_token"]
    headers = {"Accept":"application/json","Content-Type":"application/json", "Authorization":bearer, 'csp-auth-token':results.json()["access_token"] }
    
    results = invite( header=headers,
                      id=inputs['orgId'],
                      usernames=inputs['usernames'],
                      cloud_assembly=True,
                      code_stream=True,
                      service_broker=True)
    

    print(results)

    