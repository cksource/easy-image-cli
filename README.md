
# easy-image cli
  Console application for uploading images from your drive to the Easy Image service.

### Requirements
  - node@v8.9.0
  - npm@v4
    
### Installation
    npm install easy-image-cli
   
### Usage

    easy-image-cli upload [options] <filePath> <uploadUrl>

  One of the following options must be provided:
    * Token URL
    * (or) Environment ID and Access Key.

  The correct values of Environment ID and Access Key can be found in the
  CKEditor Ecosystem dashboard: https://dashboard.ckeditor.com.
  As a token URL you may use the development token URL, also available in the dashboard.

  Examples:

    easy-image-cli upload ./images/ https://XXX.cke-cs.com/easyimage/upload/ -t http://example.com/token/ --output images.json

  OR

    easy-image-cli upload ./images/ https://XXX.cke-cs.com/easyimage/upload/ -e FsBgSO -k dGaXSA9uTlAs --output images.json

  Options:

    -e, --environment <environment>  Environment ID
    -k, --key <key>                  Secret key
    -t, --tokenUrl <url>             Token URL
    -o, --output <path>              Path to the file where result should be saved
    -h, --help                       output usage information
