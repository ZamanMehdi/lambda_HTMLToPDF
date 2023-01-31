# lambda_HTMLToPDF

Steps to create lambda function
1. Download as .zip file
2. remove git and gitignore file
3. Change .html file according to your task
4. Use "{{}}" for variables, i.e {{variable}} in .html file
5. Change .html file name and bucket name in index.js
6. Create a lambda function and configure it accordingly, for me I have used node: 12.x, memory: 512, Architecture: x86_64, Timeout: 15min 0sec, Ephemeral storage: 512MB, and give permision role accordingly.
7. Upload .zip file in code section of lambda function
8. Use function with function name and pass variables in JSON object.
