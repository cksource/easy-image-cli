#easy-image cli
    Console app for moving images from your drive into easy-image service.

### Requirements
    - node@v8.9.0
    - npm@v4
    
### Installation
    npm install
   
### Usage
    For savig images addresses in file use stdout to file redirection.
    
    Example: 
    node index.js upload -p /User/Admin/images/ -u http://example.com/upload/ -t http://example.com/token/ > result.json
    
### Options
         -p, --path <filePath>            Path to file or directory
         -e, --environment <environment>  Environment id
         -k, --key <key>                  Access key
         -u, --uploadUrl <url>            Upload URL
         -t, --tokenUrl <url>             Token URL
         -h, --help                       output usage information
         
    Warning: tokenUrl or environment id with key must be passed.
