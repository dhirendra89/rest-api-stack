import requests;

def handler(event: any, context):
    print('Hello from Python Lambda!')

    response = requests.get('XXXXXXXXX')
    json = response.json()
    print(json)