# Secrets setup (do this once, before the site goes live)

The repo contains no secrets and never will. Your password and salt live in a single file that you create by hand on the server, outside the web folder, where git can never overwrite or expose it.

## Step 1: create the folder

Hostinger hPanel, File Manager. Open `domains/strongmomquotes.com/`. You will see `public_html` there. Create a new folder NEXT TO it (not inside it) called:

```
strongmomquotes_private
```

The result should look like:

```
domains/strongmomquotes.com/
    public_html/            <- the website (git deploys here)
    strongmomquotes_private/  <- your secrets and the leads database
```

## Step 2: create secrets.php inside that folder

Inside `strongmomquotes_private`, create a file called `secrets.php`. Copy the contents of `SECRETS-TEMPLATE.php` from the repo into it, then fill in the three values:

- `ADMIN_PASSWORD`: your login for `leads.php`. Long and unique.
- `SITE_SALT`: a random string of 32 or more characters. Generate it in a password manager. It signs the anti-bot token and hashes IP addresses.
- `NOTIFY_EMAIL`: `info@strongmomquotes.com` (create the mailbox in hPanel, Emails; forward it to Gmail if you like).

Save.

## Step 3: check it worked

Visit `https://strongmomquotes.com/leads.php`. You should see a normal password prompt. If you instead see the message "Admin is locked because the secrets file is missing", the file is in the wrong place or has a typo: recheck the folder name and that the file returns an array.

## Why it is built this way

Git history is permanent. A password committed once can be recovered even after a repository is made private, so the only safe rule is that secrets never enter git at all. This setup also means a redeploy can never wipe your password or your leads database, because neither of them lives in the deployed folder.

If the secrets file is ever missing, the site fails SAFE: the public pages and the card maker keep working, and the admin panel refuses every login rather than falling open.
