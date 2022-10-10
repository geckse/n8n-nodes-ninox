<img src="https://raw.githubusercontent.com/geckse/n8n-nodes-ninox/master/nodes/Ninox/ninox.svg" align="left" height="74" width="74"> 

# Ninox Nodes for n8n

This community package contains two nodes to integrate your [Ninox](https://ninox.com) Database with [n8n](https://n8n.io/).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

It adds two nodes:

| Ninox Node  | Ninox Trigger Node |
| ------------- | ------------- |
| Operations: List, read, create, update delete Records and files and run Ninox Scripts  | Events: on create or change of records via polling |

[Supported Operations](#supported-operations)  
[Installation](#installation)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Notes for an improvement](#Notes-for-an-improvement)  
[Resources](#resources)  
[Integration Approach](#integration-approach)  
[About](#about)  
[Version History](#version-history)  

## Supported Operations

| Operation  | Description | Options |
| ------------- |  ------------- |  ------------- | 
| List  | List records of a table | Return all records OR Paginate trough them, Sorting, Filtering (eq. search), Created Since Sequence, Created Since ID  |
| Read  | Get record of a table by ID | - |
| Create  | Create a new record in a table | add all fields or define a specific subset |
| Update  | Update a record in a table by ID | update all fields or define a specific subset |
| Delete  | Delete a record in a table by ID | - |
| List Attached Files  | Get the attached files of a record by ID | - |
| Download Attached File | Get the actual binary of a attachment by file name | - |
| Upload File Attachment | Upload a new file to record | optional: add an Attachment Field ID or Name. When defined, the file will be uploaded into the field |
| Delete Attached File | Remove a attached file from record by file name | - |
| Ninox Script | Send and run a Ninox Script to query data or run actions on your Ninox database | - |


## Installation
Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

Since the nodes communicate with the Ninox REST API you'll have to obtain an Ninox API Key and add it as Ninox API Credential in n8n.io.

Follow these steps as you can find in the [api docs of Ninox](https://docs.ninox.com/en/api/introduction#obtaining-a-personal-access-token):
1. Visit ninox.com. 
2. Click the Start Ninox button to open the web app. 
3. If you don't see the Start Ninox button, log in with your Ninox credentials first.
4. In the top-right corner, click the Actions gear icon.
5. In the drop-down menu, select Integrations.
6. In the pop-up window, click the Generate button.
7. Copy the API key to your clipboard.
8. Create a new Ninox API Credential in your n8n instance
9. Add the API key.

**Keep in mind: This API ley provides access to all your Ninox teams and all the Ninox databases of these teams. You should handle this key with care.**

### Credentials for Ninox Private Cloud & Ninox On-Premise

Basicly the same steps as for Public Cloud users. 
You just need to define a Custom URL in the n8n credentials for Ninox.
Your URL will be something like ```https://mycompany.ninox.com/v1``` for Private Cloud users and ```https://myninox.mydomain.com/v1``` for On-Premise users.

## Compatibility

The Latest Version of n8n. If you encounter any problem, feel free to [open an issue](https://github.com/geckse/n8n-nodes-ninox) on Github. 

## Notes for an improvement
Currently the Create and Update operation run a request for each Item. It would be an optimization to batch these additions in a single request since the Ninox API supports that. But at this moment I was not able to make that request in the declarative implementation in n8n of this node. I might add this in the future. 

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Ninox API Documentation](https://docs.ninox.com/de/altes-handbuch/ninox-api/ninox-rest-api)

## Integration Approach

This node communicates with the [Ninox REST API](https://docs.ninox.com/de/altes-handbuch/ninox-api/ninox-rest-api). The CRUD Operations are simple REST-API calls. For the Trigger Node I choosed to work with the sequence id. Everytime a change is made or a record is created the sequence number in your ninox table will be incremented by one. That made it pretty easy to get the difference between two sequences.

## About

<img src="https://let-the-work-flow.com/content/uploads/logo-let-the-work-flow-signet-quad-150x150.png" align="left" height="74" width="74"> 
<br>
Hi I'm geckse and I let your work flow! 👋 
I hope you are enyoing these nodes. If you are in need of a smooth automation, steady integration or custom code check my page: https://let-the-work-flow.com

## Version History

### 1.1.3
- Fix missing Record ID and File Name fields in Delete File Attachment operation

### 1.1.2
- Added dynamical loaded dropdowns for TeamID, DatabaseID & TeamID

### 1.1.1
- Fix wrong baseURL for Credentials testing

### 1.1.0
- Upload File Attachment: new optional option "Attachment Field"
- Credentials: added custom base url for Ninox on-prem & private cloud users
