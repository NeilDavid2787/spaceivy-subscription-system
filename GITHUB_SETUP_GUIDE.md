# 🚀 GitHub → Hostinger Auto-Deploy Setup

## 📋 **Step-by-Step Setup:**

### **Step 1: Create GitHub Repository**
1. **Go to** [GitHub.com](https://github.com)
2. **Click** "New repository"
3. **Name**: `spaceivy-subscription-system`
4. **Description**: "Complete subscription billing system with automated notifications"
5. **Make it Public**
6. **Click** "Create repository"

### **Step 2: Connect Local Code to GitHub**
```bash
# In your terminal, run these commands:
git remote add origin https://github.com/YOUR_USERNAME/spaceivy-subscription-system.git
git branch -M main
git push -u origin main
```

### **Step 3: Set Up Hostinger Auto-Deploy**

#### **Option A: GitHub Actions (Recommended)**
1. **Create file** `.github/workflows/deploy.yml` in your repository
2. **Add this content**:

```yaml
name: Deploy to Hostinger
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Hostinger
      uses: SamKirkland/FTP-Deploy-Action@4.3.3
      with:
        server: your-ftp-server.hostinger.com
        username: your-username
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./
        server-dir: /public_html/billing/
```

#### **Option B: Hostinger Git Integration**
1. **Go to** Hostinger Control Panel
2. **Find** "Git Version Control" or "Deploy from Git"
3. **Connect** your GitHub repository
4. **Set** deployment directory to `/public_html/billing/`
5. **Enable** auto-deploy on push

### **Step 4: Test the Workflow**
1. **Make a small change** to any file
2. **Commit and push** to GitHub
3. **Check** if your website updates automatically

## 🎯 **Benefits of This Setup:**

✅ **I can make changes** directly to your code
✅ **GitHub automatically deploys** to Hostinger
✅ **No more manual uploads** needed
✅ **Version control** of all changes
✅ **Easy rollback** if something breaks
✅ **Professional development workflow**

## 🔧 **After Setup:**

Once this is working, I can:
- **Make changes** to your subscription system
- **Push updates** to GitHub
- **Your website updates** automatically
- **You just need to approve** the changes

## 📞 **Need Help?**

If you get stuck on any step, let me know and I'll guide you through it!

**This will save you tons of time in the future!** 🚀
