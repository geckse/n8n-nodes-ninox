<img src="https://raw.githubusercontent.com/geckse/n8n-nodes-ninox/master/nodes/Ninox/ninox.svg" align="left" height="74" width="74"> 

# Ninox Nodes for n8n

This community package contains two powerful nodes to integrate your [Ninox](https://ninox.com) Database with [n8n](https://n8n.io/).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Available Nodes

| Ninox Node | Ninox Trigger Node |
| ------------- | ------------- |
| **Record Operations**: List, Read, Create, Update, Delete records with smart field mapping<br/>**File Operations**: Upload, Download, List, Delete file attachments<br/>**Schema Operations**: Get database, tables, and field schemas<br/>**Scripting**: Execute Ninox Scripts | **Events**: Trigger on create or change of records via polling<br/>**Sync Tracking**: Uses sequence IDs for efficient change detection |

The node features a resource-based architecture with enhanced field mapping, schema access, and advanced filtering capabilities. Full backward compatibility with previous versions is maintained.

- [Supported Operations](#supported-operations)
- [Key Features](#key-features)
- [Installation](#installation)
- [Credentials](#credentials)
- [Usage Examples](#usage-examples)
- [Compatibility](#compatibility)
- [Notes for an improvement](#notes-for-an-improvement)
- [Resources](#resources)
- [Integration Approach](#integration-approach)
- [About](#about)
- [Version History](#version-history)

## Supported Operations

The node uses a **resource-based architecture** that organizes operations by type for better clarity and usability.

### Resources
- **Record** - All record-related operations
- **File** - File attachment operations
- **Schema** - Database schema operations

| Resource | Operation  | Description | Options |
| ------------- | ------------- |  ------------- |  ------------- |
| **Record** | List  | List records of a table | Return all records OR Paginate with advanced filtering: Sort by field/latest modified/created, Filters (JSON), Since ID, Since Sequence  |
| | Read  | Get record of a table by ID | - |
| | Create  | Create a new record in a table | Smart field mapping with resourceMapper: auto-map input data or define specific fields |
| | Update  | Update a record in a table by ID | Smart field mapping with resourceMapper: auto-map input data or define specific fields |
| | Delete  | Delete a record in a table by ID | - |
| | Ninox Script | Send and run a Ninox Script to query data or run actions on your Ninox database | Parse As JSON, Split Into Items, Fetch As Records |
| **File** | List Attached Files  | Get the attached files of a record by ID | - |
| | Download Attached File | Get the actual binary of a attachment by file name | - |
| | Upload File Attachment | Upload a new file to record | Optional: Add an Attachment Field ID or Name to upload into specific field |
| | Delete Attached File | Remove a attached file from record by file name | - |
| **Schema** | Get Database Schema | Retrieve the schema for a single database | - |
| | Get Tables Schema | Retrieve the schema for all tables in a database | - |
| | Get Single Table Schema | Retrieve the schema for a single table with field definitions | - |


## Key Features

### Resource-Based Architecture
Operations are organized into three distinct resources for cleaner workflow design:
- **Record**: Core CRUD operations and scripting
- **File**: All file attachment operations
- **Schema**: Metadata operations for database introspection

### Smart Field Mapping
- **Automatic Field Discovery**: Fields are dynamically loaded from your Ninox table schema
- **Two Mapping Modes**:
  - `Define Below`: Manually select and map specific fields
  - `Auto-Map Input Data`: Automatically maps input data to matching fields
- **Type Safety**: Intelligent type mapping between Ninox and n8n field types

### Schema Operations
Programmatic access to your database structure:
- **Get Database Schema**: Retrieve metadata for an entire database
- **Get Tables Schema**: List all tables with their properties
- **Get Single Table Schema**: Detailed field definitions for a specific table

### Advanced Data Filtering
Enhanced options for the List operation:
- Sort by any field (ascending/descending)
- Sort by latest modified or created records
- JSON-based filters for complex queries
- Synchronization tracking with Since ID and Since Sequence parameters

### Enhanced Ninox Script Execution
Flexible script result handling:
- **Parse As JSON**: Parse complex script responses as structured JSON
- **Split Into Items**: Automatically split array results into individual workflow items
- **Fetch As Records**: Automatically fetch full record data when script returns IDs
- Intelligent record ID parsing with automatic table detection

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

**Keep in mind: This API key provides access to all your Ninox teams and all the Ninox databases of these teams. You should handle this key with care.**

### Credentials for Ninox Private Cloud & Ninox On-Premise

Basically the same steps as for Public Cloud users.
You just need to define a Custom URL in the n8n credentials for Ninox.
Your URL will be something like ```https://mycompany.ninox.com/v1``` for Private Cloud users and ```https://myninox.mydomain.com/v1``` for On-Premise users.

## Usage Examples

### Using Schema Operations
Dynamically discover your database structure:
1. Use "Get Tables Schema" to list all available tables
2. Use "Get Single Table Schema" to get field definitions
3. Build dynamic workflows based on your database structure

### Smart Field Mapping
When creating or updating records:
1. Select Resource: "Record"
2. Select Operation: "Create" or "Update"
3. In Fields section, choose mapping mode:
   - "Auto-Map Input Data": Automatically maps matching fields from input
   - "Define Below": Manually select and map specific fields

### Advanced List Filtering
For complex data queries:
1. Select Resource: "Record", Operation: "List"
2. Enable advanced options:
   - Sort by Field: Choose field and direction (ASC/DESC)
   - Filters: Add JSON query like `{"field": "status", "op": "=", "value": "active"}`
   - Since Sequence: Track changes since last sync

### Ninox Script Options
The Ninox Script operation provides flexible data handling options:

#### Parse As JSON
Enable this option to parse the entire script response as JSON and return it as a single item. This is ideal for:
- Complex nested data structures
- Aggregated results
- Custom formatted responses

#### Split Into Items
When your script returns an array (like record IDs), enable this to split each array element into individual n8n items. For example:
- A script returning `["B78670", "B78671", "B78672"]` becomes 3 separate items
- Works with Ninox's nested array format `[["ID1", "ID2", "ID3"]]`

#### Fetch As Records
Use together with "Split Into Items" when your script returns record IDs. This option will:
1. Split the array of IDs into individual items
2. Automatically fetch the full record data for each ID
3. Return complete record objects instead of just IDs

**Example workflow:**
1. Run a Ninox Script that returns filtered record IDs
2. Enable "Split Into Items" + "Fetch As Records"
3. Receive full record data for each matched ID

**Note:** The Fetch As Records option automatically extracts the table ID from the record ID format (e.g., "B78670" → table "B", record "78670").

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
I hope you are enjoying these nodes. If you are in need of a smooth automation, steady integration or custom code check my page: https://let-the-work-flow.com

## Version History

### 2.1.0 (Current)
- Enhanced Ninox Script operation with flexible result handling:
  - Added "Parse As JSON" option for complex data structures
  - Added "Split Into Items" to split array responses into individual items
  - Added "Fetch As Records" to automatically fetch full record data from IDs
  - Intelligent record ID parsing with automatic table detection
- Improved error handling and stability

### 2.0.0
- **Major Release**: Resource-based architecture
- Added Schema operations for database introspection
- Smart field mapping with automatic discovery
- Enhanced filtering and sorting for List operation
- Full backward compatibility maintained

### 1.1.3
- Fix missing Record ID and File Name fields in Delete File Attachment operation

### 1.1.2
- Added dynamical loaded dropdowns for TeamID, DatabaseID & TeamID

### 1.1.1
- Fix wrong baseURL for Credentials testing

### 1.1.0
- Upload File Attachment: new optional option "Attachment Field"
- Credentials: added custom base url for Ninox on-prem & private cloud users
