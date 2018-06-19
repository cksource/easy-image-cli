
# easy-image cli
    Console app for moving images from your drive into easy-image service.

### Requirements
    - node@v8.9.0
    - npm@v4
    
### Installation
    npm install easy-image-cli
   
### Usage
    easy-image-cli upload /User/Admin/images/ http://example.com/upload/ -t http://example.com/token/ --output images.json
    
### Options
      easy-image-cli upload <filePath> <uploadUrl> [options]
    
      Options:
    
        -e, --environment <environment>  Environment id
        -k, --key <key>                  Access key
        -t, --tokenUrl <url>             Token URL
        -o, --output <path>              Path to the file where result should be saved
        -h, --help                       output usage information

         
         Warning: tokenUrl or environment id with key must be passed.
