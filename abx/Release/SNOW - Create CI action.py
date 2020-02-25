from botocore.vendored import requests
import json
import boto3
#client = boto3.client('ssm','ap-southeast-2') ##AWS SSM

def handler(context, inputs):
    
    #snowUser = client.get_parameter(Name="serviceNowUserName",WithDecryption=False) ##AWS SSM
    #snowPass = client.get_parameter(Name="serviceNowPassword",WithDecryption=True) ##AWS SSM
    snowUser =  inputs['serviceNowUserName']
    snowPass =  inputs['serviceNowPassword']
    table_name = "cmdb_ci_vmware_instance"
    url = "https://" + inputs['instanceUrl'] + "/api/now/table/{0}".format(table_name)
    headers = {'Content-type': 'application/json', 'Accept': 'application/json'}
    payload = {
        #'name': inputs['customProperties']['serviceNowHostname'],
        'cpus': int(inputs['cpuCount']),
        'memory': inputs['memoryInMB'],
        'correlation_id': inputs['deploymentId'],
        'disks_size': int(inputs['customProperties']['provisionGB']),
        'location': "Sydney",
        'vcenter_uuid': inputs['customProperties']['vcUuid'],
        'state': 'On',
        'sys_created_by': inputs['__metadata']['userName'],
        'owned_by': inputs['__metadata']['userName']
        }
    
    results = requests.post(
        url,
        json=payload,
        headers=headers,
        #auth=(snowUser['Parameter']['Value'], snowPass['Parameter']['Value'])
        auth=(snowUser, snowPass)
    )
    print(results.text)
    
    #parse response for the sys_id of CMDB CI reference
    if json.loads(results.text)['result']:
        serviceNowResponse = json.loads(results.text)['result']
        serviceNowSysId = serviceNowResponse['sys_id']
        print(serviceNowSysId)
       
        #update the serviceNowSysId customProperty
        outputs = {}
        outputs['customProperties'] = inputs['customProperties']
        outputs['customProperties']['serviceNowSysId'] = serviceNowSysId;
        return outputs