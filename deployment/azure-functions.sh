
# Azure Functions Deployment (Free Tier)
az group create --name nft-empire-rg --location eastus
az functionapp create --resource-group nft-empire-rg --consumption-plan-location eastus --runtime node --runtime-version 18 --functions-version 4 --name genemint-functions --storage-account genemintstorage
az functionapp deployment source config --name genemint-functions --resource-group nft-empire-rg --repo-url https://github.com/imfromfuture3000-Android/The-Futuristic-Kami-Omni-Engine --branch main
