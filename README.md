<img src="https://raw.githubusercontent.com/geckse/n8n-nodes-ninox/master/nodes/Ninox/ninox.svg" align="left" height="74" width="74"> 

# Ninox Nodes for n8n.io

This community package contains two nodes to integrate your Ninox Database with n8n.io.
It adds two nodes:

| Ninox Node  | Ninox Trigger Node |
| ------------- | ------------- |
| Operations: List, read, create, update delete Records  | Events: on create or change of records via polling |

## State of Development

- [x] Properly authenticate with Ninox
- [x] Create Ninox Record(s) via Node
- [x] Get a single Record by ID
- [x] Update Ninox Records
- [x] Update Ninox Record by ID
- [x] Trigger Node listening for changes in a table
- [x] Pagination of List Operation
- [x] Ordering of List Operation
- [x] Make use of Filter Parameter
- [ ] Get File Attachments
- [ ] Add new File Attachments
- [ ] Remove File Attachments


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

## Compatibility

The Latest Version of n8n. If you encounter any problem, feel free to [open an issue](https://github.com/geckse/n8n-nodes-ninox) on Github. 

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Ninox API Documentation](https://docs.ninox.com/de/altes-handbuch/ninox-api/ninox-rest-api)

## Integration Approach

This node communicates with the [Ninox REST API](https://docs.ninox.com/de/altes-handbuch/ninox-api/ninox-rest-api). The CRUD Operations are simple REST-API calls. For the Trigger Node I choosed to work with the sequence id. Everytime a change is made or a record is created the sequence number in your ninox table will be incremented by one. That made it pretty easy to get the difference between two sequences. 
