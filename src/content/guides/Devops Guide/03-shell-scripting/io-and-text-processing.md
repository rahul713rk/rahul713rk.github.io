# I/O and Text Processing: The Data Pipeline

Version: 1.0.0
Last Updated: 2026-03-09
Prerequisites: Module 3.1 & 3.2

## 1. Redirection and Pipes

### Story Introduction

Imagine a **Water Plumbing System** in a house.

1.  **Standard Input (0)**: The main water line coming from the city into your house.
2.  **Standard Output (1)**: The clean water coming out of your sink faucet.
3.  **Standard Error (2)**: A separate overflow pipe that only drips if there's a leak in the system.

Normally, the clean water (Output) goes into a bowl (The Screen). But you can **Redirect** it:
*   Instead of the bowl, you can send the water into a tank (`> file`).
*   Instead of the faucet, you can suck water out of a bucket (`< file`).
*   You can even connect the drain of one sink directly to the faucet of another—this is a **Pipe (`|`)**. This allows you to process data through multiple "filing" steps without ever saving it to a disk.

### Concept Explanation

In Linux, "Everything is a file," and data flows between three standard streams:
*   **stdin (0)**: keyboard input.
*   **stdout (1)**: normal output.
*   **stderr (2)**: error messages.

#### Operators:
*   `> file`: Redirect stdout to a file (overwrites).
*   `>> file`: Append stdout to a file.
*   `2> file`: Redirect ONLY errors to a file.
*   `&> file`: Redirect both stdout and stderr to a file.
*   `|`: Sends the output of one command as the input to the next.

### Code Example

```bash
#!/bin/bash
# processing.sh

# 1. Redirection
ls /root 2> error.log  # This will fail and save the error to a file
echo "Log check complete" > status.txt

# 2. Piping and Filtering
# Find all users with a bash shell, sort them, and count
cat /etc/passwd | grep "/bin/bash" | cut -d: -f1 | sort | uniq -c

# 3. Sed: Found and Replace
# Change "Error" to "WARNING" in our log file
sed -i 's/Error/WARNING/g' error.log

# 4. Awk: Column Processing
# Print only the 1st and 3rd columns of the process list
ps -ef | awk '{print $1, $2}'
```

### Step-by-Step Walkthrough

1.  **`grep "/bin/bash"`**: Filters the large `/etc/passwd` file to only show lines containing bash users.
2.  **`cut -d: -f1`**: Takes those lines, splits them by the colon (`:`), and extracts the 1st field (the username).
3.  **`sort | uniq -c`**: Groups identical names together and counts how many times each one appears.
4.  **`sed 's/old/new/g'`**: This is a "Stream Editor." It searches for a pattern and swaps it out on the fly.

### Diagram

```mermaid
graph LR
    A[Raw Data: /etc/passwd] -- cat --> P1((|))
    P1 -- grep --> P2((|))
    P2 -- cut --> P3((|))
    P3 -- sort --> B[Processed Output]
```

### Real World Usage

In **Log Analysis**, DevOps engineers often deal with gigabytes of data. Using a GUI to find a specific error is impossible. Instead, they use "One-liners" like:
`cat access.log | awk '{print $9}' | sort | uniq -c | sort -rn`
This command instantly tells you which HTTP status codes (like 404 or 500) are appearing most often in your production web server.

### Best Practices

1.  **Don't `cat` unnecessarily**: `grep "pattern" file` is faster than `cat file | grep "pattern"`.
2.  **Redirect stderr to a log**: In production scripts, always use `>> script.log 2>&1` so you can see why a cron job failed later.
3.  **Use `grep -E` for complex searches**: It allows for "Extended Regular Expressions," making it much more powerful.

### Common Mistakes

*   **Replacing too much with `sed`**: Forgetting the `g` at the end of `s/old/new/g` (it only replaces the first instance per line) or not being specific enough with the pattern.
*   **`>` vs `>>`**: Accidentally using `>` and wiping out an entire week's worth of log data instead of appending to it.
*   **Piping to `sudo`**: `ls /root | sudo grep ...` works, but `sudo ls /root > /root/out` will FAIL because the redirection `>` is handled by your shell, not by `sudo`. Use `tee` instead.

### Exercises

1.  **Beginner**: How do you redirect the output of the `ls` command to a file called `files.txt` without overwriting existing content?
2.  **Intermediate**: Write a pipe that finds all files in `/etc` that end in `.conf` and counts them.
3.  **Advanced**: Use `awk` to find the total sum of the file sizes in the current directory (from the output of `ls -l`).

### Mini Projects

#### Beginner: The Error Scraper
**Task**: Create a text file with 20 lines of dummy logs. Some lines should contain the word "ERROR". Write a Bash script that extracts those lines and saves them to `errors_only.txt`.
**Deliverable**: The log file and the `scraper.sh` script.

#### Intermediate: The Configuration Migrator
**Task**: You have a config file where some settings are marked as `DEPRECATED`. Write a script using `sed` to replace all instances of `DEPRECATED` with `ACTIVE` and save the result to a new file.
**Deliverable**: The `migrate.sh` script and a before/after comparison.

#### Advanced: The Traffic Analyzer
**Task**: Download a sample Nginx Access Log (or create one). Write a script that uses `awk` and `sort` to identify the Top 5 IP addresses that have visited your site.
**Deliverable**: A robust one-liner or script that produces a clean report of the Top 5 visitors.
