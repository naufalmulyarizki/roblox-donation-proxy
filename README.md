![preview1](https://r2.fivemanage.com/WX5Hv6yMgODTgG2WF6rml/images/backgroundgithub.png)

🎮 Sistem Notifikasi Donasi Roblox - BagiBagi Integration
Panduan lengkap instalasi dan konfigurasi sistem notifikasi donasi real-time dari BagiBagi.co ke game Roblox Anda menggunakan Railway sebagai middleware.


📋 Daftar Isi
1. [Persyaratan](https://www.perplexity.ai/search/donasi-roblox-bagibagi-co-ttiEwntRTRawgpdQYBnsyQ#persyaratan) 
2. [Setup Railway (Backend)](https://www.perplexity.ai/search/donasi-roblox-bagibagi-co-ttiEwntRTRawgpdQYBnsyQ#setup-railway-backend) 
3. [Setup Roblox (Game)](https://www.perplexity.ai/search/donasi-roblox-bagibagi-co-ttiEwntRTRawgpdQYBnsyQ#setup-roblox-game)
4. [Konfigurasi BagiBagi](https://www.perplexity.ai/search/donasi-roblox-bagibagi-co-ttiEwntRTRawgpdQYBnsyQ#testing)
5. [Testing](https://www.perplexity.ai/search/donasi-roblox-bagibagi-co-ttiEwntRTRawgpdQYBnsyQ#troubleshooting)
6. [Troubleshooting](https://www.perplexity.ai/search/donasi-roblox-bagibagi-co-ttiEwntRTRawgpdQYBnsyQ#troubleshooting)

🔧 Persyaratan
Software
1. Akun Railway.app (gratis)
2. Akun BagiBagi.co dengan link donasi aktif
3. Roblox Studio terinstall
4. TopbarPlus module untuk GUI (Download di sini)

Pengetahuan Dasar
1. Dasar-dasar Roblox Studio
2. Copy-paste script
3. Akses ke ServerScriptService dan StarterPlayer

# Setup Railway (Backend)
## Step 1: Buat Project Baru di Railway
1. Buka railway.app dan login
2. Klik "New Project"
3. Pilih "Empty Project"
4. Beri nama project: roblox-donation-proxy

## Step 2: Buat File package.json

Di Railway dashboard, buat file baru package.json:

```json
{
  "name": "roblox-donation-proxy",
  "version": "1.0.0",
  "description": "Proxy server for BagiBagi donation webhook to Roblox",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```
## Step 3: Buat File index.js
Buat file index.js dengan code berikut:

```js
const express = require('express');
const app = express();

app.use(express.json());

// Store semua donasi
let allDonations = [];
let lastSentIndex = 0;

console.log('[START] Donation server started');

// ========== WEBHOOK DARI BAGIBAGI ==========

app.post('/webhook', (req, res) => {
    console.log('='.repeat(60));
    console.log('[WEBHOOK] Donation received!');
    console.log('[WEBHOOK] Name:', req.body.name);
    console.log('[WEBHOOK] Amount:', req.body.amount);
    console.log('[WEBHOOK] Message:', req.body.message);
    
    allDonations.push({
        name: req.body.name || 'Donatur',
        amount: req.body.amount || 0,
        message: req.body.message || '',
        timestamp: new Date().toISOString()
    });
    
    console.log('[WEBHOOK] Total donations:', allDonations.length);
    console.log('='.repeat(60));
    
    res.json({ success: true });
});

// ========== CHECK DONASI UNTUK ROBLOX ==========

app.get('/check-donations', (req, res) => {
    console.log('[CHECK] Roblox checking...');
    console.log('[CHECK] Total donations:', allDonations.length);
    console.log('[CHECK] Last sent index:', lastSentIndex);
    
    if (lastSentIndex < allDonations.length) {
        const donation = allDonations[lastSentIndex];
        lastSentIndex++;
        
        console.log('[CHECK] ✅ Sending donation #' + lastSentIndex);
        console.log('[CHECK] Donor:', donation.name);
        console.log('[CHECK] Amount:', donation.amount);
        
        res.json({
            hasNewDonation: true,
            donatorName: donation.name,
            amount: donation.amount,
            message: donation.message
        });
    } else {
        console.log('[CHECK] ❌ No new donations');
        res.json({ hasNewDonation: false });
    }
});

// ========== STATUS ENDPOINT ==========

app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        totalDonations: allDonations.length,
        lastSentIndex: lastSentIndex,
        unsent: allDonations.length - lastSentIndex,
        donations: allDonations
    });
});

// ========== START SERVER ==========

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`[SERVER] ✅ Running on port ${PORT}`);
    console.log('[SERVER] Endpoints:');
    console.log('[SERVER]   POST /webhook - Receive from BagiBagi');
    console.log('[SERVER]   GET /check-donations - Check by Roblox');
    console.log('[SERVER]   GET /status - Check queue status');
    console.log('='.repeat(60));
});

```

## Step 4: Deploy ke Railway
1. Klik "Deploy" di Railway dashboard
2. Tunggu hingga status menjadi "Active"
3. Copy URL deployment (contoh: https://your-app.up.railway.app)
4. Simpan URL ini untuk digunakan di Roblox 


========================================

## 🎮 Setup Roblox (Game)
# Step 1: Install TopbarPlus
1. Download TopbarPlus module dari GitHub
2. Di Roblox Studio, buka ReplicatedStorage
3. Insert TopbarPlus module (folder bernama Icon)

# Step 2: Enable HttpService
1. Di Roblox Studio, buka Home > Game Settings
2. Pilih tab Security
3. Centang "Allow HTTP Requests"
4. Klik Save

# Step 3: Script Server (ServerScriptService)

Buat Script baru di ServerScriptService, beri nama DonationSystem_Server:

```lua
local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")

print("=" .. string.rep("=", 60))
print("[SERVER] 🟢 DONATION SYSTEM STARTED")
print("=" .. string.rep("=", 60))

-- ========== GANTI URL INI DENGAN URL RAILWAY ANDA ==========
local WEBHOOK_URL = "https://your-app.up.railway.app/check-donations"

-- ========== DATASTORE ==========

local donationDataStore = DataStoreService:GetDataStore("DonationData_v2")
local broadcastEvent = Instance.new("RemoteEvent")
broadcastEvent.Name = "BroadcastDonation"
broadcastEvent.Parent = ReplicatedStorage

local donatorList = {}
local maxDonators = 100

print("[SERVER] ✅ Events created")

-- ========== LOAD DATA ==========

local function LoadDonatorData()
    print("[SERVER] 📥 Loading data from DataStore...")
    
    local success, data = pcall(function()
        return donationDataStore:GetAsync("DonatorList")
    end)
    
    if success and data then
        donatorList = data
        print("[SERVER] ✅ Loaded", #donatorList, "donators")
    else
        print("[SERVER] ℹ️ No data found")
        donatorList = {}
    end
end

-- ========== SAVE DATA ==========

local function SaveDonatorData()
    print("[SERVER] 💾 Saving", #donatorList, "donators...")
    
    local success, err = pcall(function()
        donationDataStore:SetAsync("DonatorList", donatorList)
    end)
    
    if success then
        print("[SERVER] ✅ Saved successfully")
    else
        warn("[SERVER] ❌ Save error:", err)
    end
end

game:BindToClose(function()
    print("[SERVER] 🛑 Saving before shutdown...")
    SaveDonatorData()
end)

-- ========== ADD DONATION ==========

local function AddDonation(donorName, amount, message)
    print("[SERVER] ➕ Adding donation from:", donorName, "Amount:", amount)
    
    local found = false
    
    for idx, donator in ipairs(donatorList) do
        if donator.name == donorName then
            donator.totalAmount = donator.totalAmount + amount
            donator.count = donator.count + 1
            donator.lastDate = os.date("%d/%m/%Y %H:%M:%S")
            donator.lastMessage = message or ""
            
            print("[SERVER] ✏️ Updated:", donorName)
            found = true
            break
        end
    end
    
    if not found then
        table.insert(donatorList, 1, {
            name = donorName,
            totalAmount = amount,
            count = 1,
            firstDate = os.date("%d/%m/%Y %H:%M:%S"),
            lastDate = os.date("%d/%m/%Y %H:%M:%S"),
            lastMessage = message or ""
        })
        
        print("[SERVER] 🆕 New donator:", donorName)
    end
    
    print("[SERVER] 📢 Broadcasting notification...")
    broadcastEvent:FireAllClients(donorName, amount, message or "")
    
    wait(5)
    
    print("[SERVER] 📡 Broadcasting list update...")
    broadcastEvent:FireAllClients("UPDATE_LIST", donatorList)
    
    SaveDonatorData()
end

-- ========== REMOTE FUNCTION ==========

local getDataFunction = Instance.new("RemoteFunction")
getDataFunction.Name = "GetDonationData"
getDataFunction.Parent = ReplicatedStorage

getDataFunction.OnServerInvoke = function(player)
    print("[SERVER] 📥 Data requested by:", player.Name)
    return donatorList
end

-- ========== CHECK WEBHOOK ==========

local function CheckWebhook()
    local success, response = pcall(function()
        return HttpService:GetAsync(WEBHOOK_URL)
    end)
    
    if success then
        local decodeSuccess, data = pcall(function()
            return HttpService:JSONDecode(response)
        end)
        
        if decodeSuccess and data and data.hasNewDonation then
            print("[SERVER] 🎉 DONATION DETECTED!")
            AddDonation(data.donatorName, data.amount, data.message or "")
        end
    end
end

-- ========== INITIALIZE ==========

LoadDonatorData()

print("[SERVER] ⏰ Starting webhook check loop...")
print("[SERVER] 🟢 SYSTEM READY!")

-- ========== MAIN LOOP ==========

while true do
    wait(5)
    CheckWebhook()
end
```
⚠️ PENTING: Ganti https://your-app.up.railway.app/check-donations dengan URL Railway Anda!

# Step 4: Script Client (StarterPlayer > StarterCharacterScripts)
Buat LocalScript baru di StarterPlayer > StarterCharacterScripts, beri nama DonationSystem_Client:

```lua
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

print("[TOPBAR+] 🟢 Script started")

-- ========== LOAD TOPBARPLUS ==========

local Icon = require(ReplicatedStorage:WaitForChild("Icon"))
print("[TOPBAR+] ✅ Icon module loaded")

local broadcastEvent = ReplicatedStorage:WaitForChild("BroadcastDonation")
local getDataFunc = ReplicatedStorage:WaitForChild("GetDonationData")

print("[TOPBAR+] ✅ Events ready")

-- ========== CREATE MAIN GUI ==========

local mainGui = Instance.new("ScreenGui")
mainGui.Name = "DonationGui"
mainGui.ResetOnSpawn = false
mainGui.Parent = playerGui

-- ========== NOTIFICATION (ATAS LAYAR) ==========

local notifFrame = Instance.new("Frame")
notifFrame.Name = "Notification"
notifFrame.Size = UDim2.new(0, 500, 0, 130)
notifFrame.Position = UDim2.new(0.5, -250, 0, 10)
notifFrame.BackgroundColor3 = Color3.fromRGB(40, 40, 50)
notifFrame.BorderSizePixel = 0
notifFrame.BackgroundTransparency = 1
notifFrame.Parent = mainGui

local notifCorner = Instance.new("UICorner")
notifCorner.CornerRadius = UDim.new(0, 12)
notifCorner.Parent = notifFrame

local notifStroke = Instance.new("UIStroke")
notifStroke.Color = Color3.fromRGB(255, 215, 0)
notifStroke.Thickness = 3
notifStroke.Transparency = 1
notifStroke.Parent = notifFrame

local progressBar = Instance.new("Frame")
progressBar.Size = UDim2.new(1, 0, 0, 4)
progressBar.Position = UDim2.new(0, 0, 1, -4)
progressBar.BackgroundColor3 = Color3.fromRGB(255, 215, 0)
progressBar.BorderSizePixel = 0
progressBar.BackgroundTransparency = 1
progressBar.Parent = notifFrame

local progressFill = Instance.new("Frame")
progressFill.Size = UDim2.new(1, 0, 1, 0)
progressFill.BackgroundColor3 = Color3.fromRGB(255, 215, 0)
progressFill.BorderSizePixel = 0
progressFill.BackgroundTransparency = 1
progressFill.Parent = progressBar

-- ========== AVATAR CONTAINER ==========

local avatarContainer = Instance.new("Frame")
avatarContainer.Name = "AvatarContainer"
avatarContainer.Size = UDim2.new(0, 90, 0, 90)
avatarContainer.Position = UDim2.new(0, 10, 0.5, -45)
avatarContainer.BackgroundColor3 = Color3.fromRGB(50, 50, 60)
avatarContainer.BorderSizePixel = 0
avatarContainer.BackgroundTransparency = 1
avatarContainer.Parent = notifFrame

local containerCorner = Instance.new("UICorner")
containerCorner.CornerRadius = UDim.new(0, 12)
containerCorner.Parent = avatarContainer

local containerStroke = Instance.new("UIStroke")
containerStroke.Color = Color3.fromRGB(255, 215, 0)
containerStroke.Thickness = 2
containerStroke.Transparency = 1
containerStroke.Parent = avatarContainer

local avatarImage = Instance.new("ImageLabel")
avatarImage.Name = "Image"
avatarImage.Size = UDim2.new(1, 0, 1, 0)
avatarImage.Position = UDim2.new(0, 0, 0, 0)
avatarImage.BackgroundTransparency = 1
avatarImage.BorderSizePixel = 0
avatarImage.ScaleType = Enum.ScaleType.Crop
avatarImage.Image = ""
avatarImage.Parent = avatarContainer

local imageCorner = Instance.new("UICorner")
imageCorner.CornerRadius = UDim.new(0, 12)
imageCorner.Parent = avatarImage

-- ========== TEXT LABELS ==========

local titleLabel = Instance.new("TextLabel")
titleLabel.Size = UDim2.new(1, -115, 0, 25)
titleLabel.Position = UDim2.new(0, 110, 0, 8)
titleLabel.BackgroundTransparency = 1
titleLabel.Text = "🎉 DONASI MASUK!"
titleLabel.TextColor3 = Color3.fromRGB(255, 255, 0)
titleLabel.TextSize = 16
titleLabel.Font = Enum.Font.GothamBold
titleLabel.TextTransparency = 1
titleLabel.Parent = notifFrame

local donorLabel = Instance.new("TextLabel")
donorLabel.Size = UDim2.new(1, -115, 0, 20)
donorLabel.Position = UDim2.new(0, 110, 0, 33)
donorLabel.BackgroundTransparency = 1
donorLabel.Text = "—"
donorLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
donorLabel.TextSize = 13
donorLabel.Font = Enum.Font.Gotham
donorLabel.TextXAlignment = Enum.TextXAlignment.Left
donorLabel.TextTransparency = 1
donorLabel.Parent = notifFrame

local amountLabel = Instance.new("TextLabel")
amountLabel.Size = UDim2.new(1, -115, 0, 20)
amountLabel.Position = UDim2.new(0, 110, 0, 53)
amountLabel.BackgroundTransparency = 1
amountLabel.Text = "—"
amountLabel.TextColor3 = Color3.fromRGB(255, 200, 0)
amountLabel.TextSize = 13
amountLabel.Font = Enum.Font.GothamBold
amountLabel.TextXAlignment = Enum.TextXAlignment.Left
amountLabel.TextTransparency = 1
amountLabel.Parent = notifFrame

local messageLabel = Instance.new("TextLabel")
messageLabel.Size = UDim2.new(1, -115, 0, 25)
messageLabel.Position = UDim2.new(0, 110, 0, 73)
messageLabel.BackgroundTransparency = 1
messageLabel.Text = "—"
messageLabel.TextColor3 = Color3.fromRGB(180, 220, 255)
messageLabel.TextSize = 11
messageLabel.Font = Enum.Font.Gotham
messageLabel.TextXAlignment = Enum.TextXAlignment.Left
messageLabel.TextYAlignment = Enum.TextYAlignment.Top
messageLabel.TextWrapped = true
messageLabel.TextTransparency = 1
messageLabel.Parent = notifFrame

print("[TOPBAR+] ✅ Notification created")

-- ========== CREATE LIST PANEL ==========

local listPanel = Instance.new("Frame")
listPanel.Name = "ListPanel"
listPanel.Size = UDim2.new(0, 420, 0, 550)
listPanel.Position = UDim2.new(1, -430, 0, 60)
listPanel.BackgroundColor3 = Color3.fromRGB(30, 30, 40)
listPanel.BorderSizePixel = 0
listPanel.Visible = false
listPanel.Parent = mainGui

local listCorner = Instance.new("UICorner")
listCorner.CornerRadius = UDim.new(0, 12)
listCorner.Parent = listPanel

local listStroke = Instance.new("UIStroke")
listStroke.Color = Color3.fromRGB(255, 215, 0)
listStroke.Thickness = 2
listStroke.Parent = listPanel

local header = Instance.new("TextLabel")
header.Name = "Header"
header.Size = UDim2.new(1, 0, 0, 50)
header.BackgroundColor3 = Color3.fromRGB(50, 50, 60)
header.BorderSizePixel = 0
header.Text = "📊 DAFTAR DONATUR"
header.TextColor3 = Color3.fromRGB(255, 215, 0)
header.TextSize = 14
header.Font = Enum.Font.GothamBold
header.Parent = listPanel

local headerCorner = Instance.new("UICorner")
headerCorner.CornerRadius = UDim.new(0, 12)
headerCorner.Parent = header

local totalLabel = Instance.new("TextLabel")
totalLabel.Name = "TotalLabel"
totalLabel.Size = UDim2.new(1, -20, 0, 20)
totalLabel.Position = UDim2.new(0, 10, 0, 5)
totalLabel.BackgroundTransparency = 1
totalLabel.Text = "💰 TOTAL: Rp 0"
totalLabel.TextColor3 = Color3.fromRGB(255, 200, 0)
totalLabel.TextSize = 12
totalLabel.Font = Enum.Font.GothamBold
totalLabel.TextXAlignment = Enum.TextXAlignment.Left
totalLabel.Parent = header

local scrollFrame = Instance.new("ScrollingFrame")
scrollFrame.Name = "ScrollFrame"
scrollFrame.Size = UDim2.new(1, 0, 1, -50)
scrollFrame.Position = UDim2.new(0, 0, 0, 50)
scrollFrame.BackgroundTransparency = 1
scrollFrame.BorderSizePixel = 0
scrollFrame.ScrollBarThickness = 8
scrollFrame.ScrollBarImageColor3 = Color3.fromRGB(255, 215, 0)
scrollFrame.Parent = listPanel

local listLayout = Instance.new("UIListLayout")
listLayout.Padding = UDim.new(0, 8)
listLayout.Parent = scrollFrame

print("[TOPBAR+] ✅ List panel created")

-- ========== CREATE TOPBARPLUS ICON ==========

local donationIcon = Icon.new()
donationIcon:setName("DonationIcon")
donationIcon:setImage("rbxassetid://6034047591")
donationIcon:setLabel("Donasi")
donationIcon:setOrder(1)
donationIcon:align("Center")
donationIcon:bindToggleItem(listPanel)

print("[TOPBAR+] ✅ TopbarPlus icon created")

-- ========== CACHE DATA ==========

local cachedDonators = {}

-- ========== FUNCTIONS ==========

local function PlaySound()
    local sound = Instance.new("Sound")
    sound.Volume = 0.5
    sound.SoundId = "rbxassetid://6857657306"
    sound.Parent = playerGui
    sound:Play()
    game:GetService("Debris"):AddItem(sound, 2)
end

local function ShowNotification(donor, amount, message)
    print("[TOPBAR+] 🔔 Notification for:", donor)
    
    PlaySound()
    
    donorLabel.Text = "💚 " .. donor .. " berdonasi!"
    amountLabel.Text = "💰 Rp " .. tostring(amount)
    messageLabel.Text = message and message ~= "" and ("📝 " .. message) or "📝 (tanpa pesan)"
    progressFill.Size = UDim2.new(1, 0, 1, 0)
    
    if avatarImage then
        avatarImage.Image = ""
    end
    
    -- Try load avatar
    spawn(function()
        local success, userId = pcall(function()
            return Players:GetUserIdFromNameAsync(donor)
        end)
        
        if success and userId then
            print("[TOPBAR+] ✅ User found:", userId)
            local avatarUrl = "https://www.roblox.com/headshot-thumbnail/image?userId=" .. tostring(userId) .. "&width=420&height=420&format=png"
            
            if avatarImage and avatarContainer then
                avatarImage.Image = avatarUrl
                avatarContainer.BackgroundTransparency = 0.3
                containerStroke.Transparency = 0
            end
        else
            print("[TOPBAR+] ⚠️ User not found")
            if avatarContainer then
                avatarContainer.BackgroundTransparency = 0.5
                containerStroke.Transparency = 0.5
            end
        end
    end)
    
    -- Animation
    local tweenIn = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
    
    TweenService:Create(notifFrame, tweenIn, {BackgroundTransparency = 0}):Play()
    TweenService:Create(notifStroke, tweenIn, {Transparency = 0}):Play()
    TweenService:Create(avatarContainer, tweenIn, {BackgroundTransparency = 0.3}):Play()
    TweenService:Create(titleLabel, tweenIn, {TextTransparency = 0}):Play()
    TweenService:Create(donorLabel, tweenIn, {TextTransparency = 0}):Play()
    TweenService:Create(amountLabel, tweenIn, {TextTransparency = 0}):Play()
    TweenService:Create(messageLabel, tweenIn, {TextTransparency = 0}):Play()
    TweenService:Create(progressBar, tweenIn, {BackgroundTransparency = 0}):Play()
    TweenService:Create(progressFill, tweenIn, {BackgroundTransparency = 0}):Play()
    
    TweenService:Create(progressFill, TweenInfo.new(5, Enum.EasingStyle.Linear), {Size = UDim2.new(0, 0, 1, 0)}):Play()
    
    wait(5)
    
    local tweenOut = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
    
    TweenService:Create(notifFrame, tweenOut, {BackgroundTransparency = 1}):Play()
    TweenService:Create(notifStroke, tweenOut, {Transparency = 1}):Play()
    TweenService:Create(avatarContainer, tweenOut, {BackgroundTransparency = 1}):Play()
    TweenService:Create(containerStroke, tweenOut, {Transparency = 1}):Play()
    TweenService:Create(titleLabel, tweenOut, {TextTransparency = 1}):Play()
    TweenService:Create(donorLabel, tweenOut, {TextTransparency = 1}):Play()
    TweenService:Create(amountLabel, tweenOut, {TextTransparency = 1}):Play()
    TweenService:Create(messageLabel, tweenOut, {TextTransparency = 1}):Play()
    TweenService:Create(progressBar, tweenOut, {BackgroundTransparency = 1}):Play()
    TweenService:Create(progressFill, tweenOut, {BackgroundTransparency = 1}):Play()
    
    wait(0.3)
    
    if avatarImage then
        avatarImage.Image = ""
    end
    
    donorLabel.Text = "—"
    amountLabel.Text = "—"
    messageLabel.Text = "—"
end

local function UpdateList(donationList)
    print("[TOPBAR+] 📋 Updating list:", #donationList)
    
    for _, item in pairs(scrollFrame:GetChildren()) do
        if item.Name == "DonationItem" then
            item:Destroy()
        end
    end
    
    -- Sort dari tertinggi
    local sortedList = {}
    for _, d in ipairs(donationList) do
        table.insert(sortedList, d)
    end
    
    table.sort(sortedList, function(a, b)
        return (a.totalAmount or 0) > (b.totalAmount or 0)
    end)
    
    local grandTotal = 0
    
    for idx, donator in ipairs(sortedList) do
        grandTotal = grandTotal + donator.totalAmount
        
        local item = Instance.new("Frame")
        item.Name = "DonationItem"
        item.Size = UDim2.new(1, -10, 0, 85)
        item.BackgroundColor3 = Color3.fromRGB(45, 45, 55)
        item.BorderSizePixel = 0
        item.Parent = scrollFrame
        
        local itemCorner = Instance.new("UICorner")
        itemCorner.CornerRadius = UDim.new(0, 8)
        itemCorner.Parent = item
        
        local badge = Instance.new("TextLabel")
        badge.Size = UDim2.new(0, 40, 0, 40)
        badge.Position = UDim2.new(0, 8, 0.5, -20)
        badge.BackgroundColor3 = Color3.fromRGB(255, 215, 0)
        badge.BorderSizePixel = 0
        badge.Text = tostring(idx)
        badge.TextColor3 = Color3.fromRGB(40, 40, 50)
        badge.TextSize = 18
        badge.Font = Enum.Font.GothamBold
        badge.Parent = item
        
        local badgeCorner = Instance.new("UICorner")
        badgeCorner.CornerRadius = UDim.new(1, 0)
        badgeCorner.Parent = badge
        
        local name = Instance.new("TextLabel")
        name.Size = UDim2.new(0, 360, 0, 18)
        name.Position = UDim2.new(0, 55, 0, 8)
        name.BackgroundTransparency = 1
        name.Text = "💚 " .. donator.name
        name.TextColor3 = Color3.fromRGB(255, 255, 255)
        name.TextSize = 14
        name.Font = Enum.Font.GothamBold
        name.TextXAlignment = Enum.TextXAlignment.Left
        name.Parent = item
        
        local totalAmount = Instance.new("TextLabel")
        totalAmount.Size = UDim2.new(0, 360, 0, 16)
        totalAmount.Position = UDim2.new(0, 55, 0, 26)
        totalAmount.BackgroundTransparency = 1
        totalAmount.Text = "💰 Total: Rp " .. tostring(donator.totalAmount)
        totalAmount.TextColor3 = Color3.fromRGB(255, 200, 0)
        totalAmount.TextSize = 13
        totalAmount.Font = Enum.Font.GothamBold
        totalAmount.TextXAlignment = Enum.TextXAlignment.Left
        totalAmount.Parent = item
        
        local countLabel = Instance.new("TextLabel")
        countLabel.Size = UDim2.new(0, 360, 0, 14)
        countLabel.Position = UDim2.new(0, 55, 0, 42)
        countLabel.BackgroundTransparency = 1
        countLabel.Text = "📊 Donasi " .. tostring(donator.count) .. "x"
        countLabel.TextColor3 = Color3.fromRGB(150, 200, 255)
        countLabel.TextSize = 11
        countLabel.Font = Enum.Font.Gotham
        countLabel.TextXAlignment = Enum.TextXAlignment.Left
        countLabel.Parent = item
        
        local lastDate = Instance.new("TextLabel")
        lastDate.Size = UDim2.new(0, 360, 0, 14)
        lastDate.Position = UDim2.new(0, 55, 0, 56)
        lastDate.BackgroundTransparency = 1
        lastDate.Text = "📅 " .. donator.lastDate
        lastDate.TextColor3 = Color3.fromRGB(160, 160, 160)
        lastDate.TextSize = 10
        lastDate.Font = Enum.Font.Gotham
        lastDate.TextXAlignment = Enum.TextXAlignment.Left
        lastDate.Parent = item
        
        local lastMsg = Instance.new("TextLabel")
        lastMsg.Size = UDim2.new(0, 360, 0, 14)
        lastMsg.Position = UDim2.new(0, 55, 0, 70)
        lastMsg.BackgroundTransparency = 1
        lastMsg.Text = "📝 " .. (donator.lastMessage ~= "" and donator.lastMessage or "(tanpa pesan)")
        lastMsg.TextColor3 = Color3.fromRGB(120, 120, 120)
        lastMsg.TextSize = 9
        lastMsg.Font = Enum.Font.Gotham
        lastMsg.TextXAlignment = Enum.TextXAlignment.Left
        lastMsg.TextTruncate = Enum.TextTruncate.AtEnd
        lastMsg.Parent = item
    end
    
    scrollFrame.CanvasSize = UDim2.new(0, 0, 0, listLayout.AbsoluteContentSize.Y + 10)
    totalLabel.Text = "💰 TOTAL: Rp " .. tostring(grandTotal)
end

-- ========== ICON EVENTS ==========

donationIcon.selected:Connect(function()
    print("[TOPBAR+] 🎯 Icon clicked")
    
    if #cachedDonators > 0 then
        UpdateList(cachedDonators)
    else
        local success, data = pcall(function()
            return getDataFunc:InvokeServer()
        end)
        if success and data then
            cachedDonators = data
            UpdateList(data)
        end
    end
end)

-- ========== BROADCAST EVENTS ==========

broadcastEvent.OnClientEvent:Connect(function(donor, amount, msg)
    if donor == "UPDATE_LIST" then
        print("[TOPBAR+] 📋 List update")
        cachedDonators = amount
        UpdateList(amount)
    else
        print("[TOPBAR+] 🔔 Notification")
        ShowNotification(donor, amount, msg or "")
    end
end)

print("[TOPBAR+] 🟢 READY!")

wait(1)
local success, data = pcall(function()
    return getDataFunc:InvokeServer()
end)
if success and data then
    cachedDonators = data
    print("[TOPBAR+] ✅ Initial data cached:", #data)
end
```
============================================

# 🔗 Konfigurasi BagiBagi

## Step 1: Setup Webhook di BagiBagi
1. Login ke BagiBagi.co
2. Buka Dashboard > Settings
3. Cari bagian Webhook URL
4. Masukkan: https://your-app.up.railway.app/webhook
5. Ganti your-app dengan URL Railway Anda
6. Klik Save

## Step 2: Test Webhook
1. Buka browser, akses: https://your-app.up.railway.app/status
2. Harusnya muncul JSON:

```json
{
  "status": "running",
  "totalDonations": 0,
  "lastSentIndex": 0,
  "unsent": 0,
  "donations": []
}

```
============================================

# 🧪 Testing
## Test 1: Manual Test (Railway Console)
Di Railway logs, test dengan:

```bash
curl -X POST https://your-app.up.railway.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","amount":10000,"message":"Test donation"}'
```

## Test 2: Check dari Roblox
1. Buka game di Roblox Studio
2. Tekan F5 (Play)
3. Tekan F9 (Console/Output)
4. Lihat log: [SERVER] ⏰ Starting webhook check loop...
5. Buat test donation di BagiBagi
6. Tunggu 5 detik, notifikasi harusnya muncul

## Test 3: Check List Donatur
1. Di game, klik icon Donasi di topbar tengah
2. List donatur harusnya muncul (diurutkan dari tertinggi)
3. Klik lagi untuk tutup

============================================

# 🐛 Troubleshooting
Masalah: "HTTP requests can only be executed by game server"
Solusi: Pastikan HttpService sudah enabled di Game Settings > Security

Masalah: Notifikasi tidak muncul
Debug:

1. Buka Output (F9) di Roblox Studio
2. Lihat log server: [SERVER] 🎉 DONATION DETECTED!
3. Jika tidak ada, cek Railway logs apakah webhook received
4. Pastikan URL di script server sudah benar

Masalah: Avatar tidak muncul
- Penyebab: Donor pakai nickname, bukan username Roblox
- Solusi: Minta donor pakai username Roblox yang valid saat donate
- Masalah: Railway tidak running

Solusi:
1. Check Railway logs untuk error
2. Pastikan package.json dan index.js sudah benar
3. Restart deployment di Railway dashboard

Masalah: Data hilang saat restart
Penyebab: DataStore tidak save dengan benar

Solusi:
1. Pastikan game sudah di-publish
2. Enable API Services di Game Settings
3. Check console untuk error DataStore

📊 Fitur
✅ Notifikasi real-time - Muncul di atas layar saat ada donasi
✅ Avatar Roblox - Tampil jika donor pakai username valid
✅ List donatur - Diurutkan dari total tertinggi
✅ Persistent data - Tersimpan di DataStore
✅ TopbarPlus integration - GUI modern dengan toggle menu
✅ Progress bar - Countdown 5 detik notifikasi
✅ Fade animation - Smooth transition in/out
✅ Sound effect - Audio saat donasi masuk

📝 Catatan
Username only: Avatar hanya muncul jika donor pakai username Roblox yang valid

Delay 5 detik: Server check webhook setiap 5 detik

Max 100 donatur: List disimpan maksimal 100 donatur terakhir

DataStore limit: Free plan Railway ada limit, untuk production gunakan paid plan

🎉 Selesai!
Sistem donasi Anda sekarang sudah siap! Setiap donasi di BagiBagi akan langsung muncul di game Roblox dengan notifikasi cantik dan avatar donor.

Support:

Railway Issues: https://help.railway.app

Roblox DevForum: https://devforum.roblox.com

TopbarPlus Docs: https://1foreverhd.github.io/TopbarPlus


