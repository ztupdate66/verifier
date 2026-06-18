# KonsoleH Email Verifier

A powerful email verification tool that **detects which email addresses and domains are hosted by konsoleH.co.za** (xneelo / Hetzner hosting). Perfect for identifying konsoleH-hosted emails in bulk lists, migration planning, or validating email configurations.

## 🚀 Quick Deploy

**Railway (Recommended)**
1. Push this repo to GitHub
2. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub
3. Add Volume at `/app/data` in Settings
4. Set env: `DATABASE_URL=file:/app/data/konsoleh.db`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions (Railway, Render, Docker, VPS).

## ✨ Features

### **KonsoleH Detection**
- **Automatic Detection**: Analyzes MX records to identify konsoleH.co.za, xneelo.com, your-server.de, and Hetzner hosting patterns
- **Server Identification**: Shows which specific konsoleH/xneelo/Hetzner mail server hosts each email
- **Hosting Statistics**: Real-time stats showing % of your list hosted on konsoleH

### **Comprehensive Email Verification**
- **Format Validation**: RFC-compliant email format checking
- **DNS Verification**: Checks if domains exist and have proper MX records
- **SMTP Verification**: Tests actual mailbox existence via SMTP `RCPT TO` probe
- **MX Record Analysis**: Shows all mail exchange records for each domain

### **Batch Processing**
- **Bulk Uploads**: Verify up to 1,000 emails per batch
- **Multiple Input Methods**: Paste emails directly, or upload .txt / .csv files
- **Concurrent Processing**: 15 parallel workers for fast verification (30-50 emails/second)
- **Progress Tracking**: Live progress updates during verification

### **Results Management**
- **Persistent Storage**: SQLite database stores all verification results
- **Smart Filtering**: Filter by "KonsoleH Only" or search by email/domain
- **CSV Export**: Download results for use in spreadsheets or CRM systems
- **Session History**: Track verification batches with custom session names
- **Domain Analytics**: View top domains and their hosting breakdown

## 🎯 Use Cases

- **Migration Planning**: Identify which email accounts need to be migrated from konsoleH
- **Hosting Audit**: Verify which domains in your organization use konsoleH hosting
- **Email List Validation**: Clean and verify bulk email lists while detecting hosting provider
- **Support & Troubleshooting**: Quickly check if a customer's email is on konsoleH infrastructure
- **Compliance**: Identify which emails are on specific South African hosting infrastructure

## 🚀 Quick Start

### Installation
```bash
npm install
npx prisma db push  # Initialize database
npm run dev         # Development mode
# or
npm run build && npm run start  # Production
```

### Usage
1. **Open** http://localhost:3000
2. **Enter emails** (one per line, or comma/semicolon separated) or upload a .txt/.csv file
3. **Click Verify** and wait for results
4. **Filter** by "KonsoleH Only" to see konsoleH-hosted emails
5. **Export** results to CSV for further analysis

## 🔍 How Detection Works

The verifier checks MX (Mail Exchange) DNS records for each domain and matches them against known konsoleH/xneelo/Hetzner patterns:

### Detected Patterns
- `*.konsoleh.co.za` - KonsoleH direct
- `*.xneelo.com` - Xneelo (konsoleH successor brand)
- `*.your-server.de` - Hetzner mail servers
- `*.hetzner.de` / `*.hetzner.co.za` - Hetzner direct
- `*.server.host` - Common shared hosting pattern

### Verification Steps
For each email address, the system:
1. **Format check**: Validates RFC-compliant email syntax
2. **DNS lookup**: Resolves MX records for the domain (with 5-min cache)
3. **Pattern matching**: Checks MX records against konsoleH patterns
4. **SMTP probe**: Connects to mail server and tests `RCPT TO` (8s timeout)
5. **Database storage**: Saves all results for future reference

## 📊 API Endpoints

### POST `/api/verify`
Verify a batch of emails.
```json
{
  "emails": ["user@example.co.za", "admin@company.com"],
  "sessionName": "Migration Batch 1"
}
```

**Response:**
```json
{
  "success": true,
  "total": 2,
  "konsolehCount": 1,
  "validCount": 2,
  "results": [...]
}
```

### GET `/api/results`
Retrieve verification results.
```
?konsolehOnly=true     # Filter konsoleH-hosted only
&search=example        # Search emails/domains
&page=1&limit=50       # Pagination
```

### GET `/api/stats`
Get verification statistics and top domains.

### DELETE `/api/results`
Clear all verification data.

## 🗄️ Database Schema

**EmailEntry**
- `email` (unique): Email address
- `domain`: Extracted domain
- `formatValid`: RFC format check
- `domainExists`: DNS resolution success
- `mxRecords`: JSON array of MX records
- `isKonsoleh`: **Boolean flag for konsoleH hosting**
- `konsolehServer`: **Detected konsoleH/xneelo server hostname**
- `smtpVerified`: SMTP deliverability check
- `verifiedAt`: Timestamp

**VerificationSession**
- `name`: Session identifier
- `totalCount`: Total emails verified
- `konsolehCount`: **Number hosted on konsoleH**
- `validCount`: SMTP valid count
- `createdAt`: Session timestamp

## 🛠️ Tech Stack

- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Prisma** - ORM with SQLite
- **Node.js DNS/Net** - Built-in DNS and SMTP verification (no external APIs)
- **Tailwind CSS** - Styling
- **Lucide Icons** - UI icons

## ⚙️ Configuration

### Environment Variables (optional)
```env
# None required - uses SQLite by default
# For PostgreSQL:
# DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### Verification Settings
Edit `src/lib/konsoleh-verifier.ts` to adjust:
- `concurrency`: Parallel workers (default: 10)
- `KONSOLEH_PATTERNS`: Add custom hosting patterns
- `smtpCheck timeout`: SMTP connection timeout (default: 8000ms)
- `dnsCache TTL`: DNS cache duration (default: 5 minutes)

## 📝 Notes

- **SMTP Verification**: Some mail servers may rate-limit or block SMTP checks. The tool handles timeouts gracefully.
- **DNS Caching**: Domain lookups are cached for 5 minutes to improve performance on duplicate domains.
- **False Negatives**: If a domain uses custom MX records that don't match known patterns, it won't be flagged as konsoleH even if hosted there.
- **South African Hosting**: konsoleH.co.za is a major South African shared hosting provider (now part of xneelo/Hetzner).

## 📄 License

MIT - feel free to use, modify, and distribute.

## 🤝 Contributing

Found a konsoleH MX pattern that's not detected? Open an issue or PR with the pattern!

---

**Built for identifying konsoleH.co.za hosted email addresses in bulk verification workflows.**
