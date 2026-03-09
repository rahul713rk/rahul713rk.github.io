# Linux Filesystem

Version: 1.0.0
Last Updated: 2026-03-09
Prerequisites: Linux Fundamentals

## 1. The Directory Hierarchy (FHS)

### Story Introduction

Imagine an **Enormous Library**.

Without a classification system, finding a specific book would be impossible. Linux uses the **Filesystem Hierarchy Standard (FHS)** to ensure every piece of the system has its own "shelf":

*   **`/` (Root)**: The foundation of the entire building.
*   **`/bin` (Binaries)**: The common tools (like pens and staplers) that everyone uses.
*   **`/etc` (Etcetera/Configuration)**: The rulebooks and settings for how the library is run.
*   **`/home`**: The personal lockers for all the library members.
*   **`/root`**: The head librarian's private office.
*   **`/var` (Variable)**: The returns pile and history logs that change every day.
*   **`/dev` (Devices)**: The hardware—the actual shelves, chairs, and computers.

In Windows, you might have different buildings (C:, D:, E:). In Linux, there is only **one building**, and everything—including other hard drives—is just a different room or floor inside that same structure.

### Concept Explanation

The Linux filesystem is a **single-rooted, inverted tree structure**. 

#### The Key Directories:
*   **`/`**: The root directory. Everything starts here.
*   **`/bin` & `/usr/bin`**: Executable programs (binaries) like `ls`, `cp`, and `cat`.
*   **`/sbin` & `/usr/sbin`**: System binaries used by the administrator (root).
*   **`/etc`**: Configuration files for the system and applications (e.g., `/etc/passwd`).
*   **`/home`**: User home directories (e.g., `/home/abhishek`).
*   **`/root`**: Home directory for the root user.
*   **`/tmp`**: Temporary files (often cleared on reboot).
*   **`/var`**: Variable data like logs (`/var/log`) and database files.
*   **`/mnt` & `/media`**: Points where you "mount" external drives or network shares.
*   **`/dev`**: Device files representing hardware.

### Diagram

```mermaid
graph TD
    Root[/]
    Root --> bin[bin]
    Root --> etc[etc]
    Root --> home[home]
    Root --> var[var]
    Root --> tmp[tmp]
    Root --> dev[dev]
    home --> user1[user-a]
    home --> user2[user-b]
    var --> log[log]
    etc --> conf[network.conf]
```

### Real World Usage

In **Kubernetes and Docker**, we often use **Volume Mounts**. This is the act of taking a directory from the "Host" library and making it appear as a specific shelf (directory) inside the "Container" library. For example, database logs from a container are typically written to `/var/log/mysql` which is actually a shortcut to a folder on the physical server.

### Exercises

1.  **Beginner**: Which directory typically contains the personal files of a user named 'alex'?
2.  **Intermediate**: If you change the IP address of your Linux server, in which top-level directory is that configuration file likely stored?
3.  **Advanced**: What is the difference between `/bin` and `/sbin`? Why is this distinction important for system security?

## 2. File Types and Inodes

### Story Introduction

Imagine a **Giant Hotel**.

You have a room (The File Data), but you don't look for the room by searching for your name on the door. You look for the **Room Number** (The Inode).

The front desk has a master ledger (The Inode Table). For every room number, it stores:
*   Who is allowed to enter (Permissions).
*   Who owns the room (Owner).
*   How big the room is (Size).
*   When the room was last cleaned (Timestamp).

The interesting part? You can have multiple different names for the same room in your guest list (Hard Links), but they all point to the same **Room Number**. If you delete the name from the guest list, the room still exists as long as there is at least one name pointing to it!

### Concept Explanation

In Linux, a file is not just its label and its content. It's actually split into two parts: the **Filename** and the **Inode**.

#### What is an Inode (Index Node)?
An Inode is a data structure that stores everything about a file *except* its actual name and its data blocks. 

#### Metadata stored in an Inode:
*   File Size.
*   Device ID.
*   User ID (UID) and Group ID (GID).
*   File Permissions (Read, Write, Execute).
*   Timestamps (Access, Modify, Change).
*   Pointers to the physical blocks on the disk where the data is stored.

#### File Types in Linux:
*   **`-`**: Regular file.
*   **`d`**: Directory.
*   **`l`**: Symbolic Link.
*   **`c`**: Character device (e.g., keyboard).
*   **`b`**: Block device (e.g., hard drive).
*   **`s`**: Socket (used for networking).
*   **`p`**: Named Pipe (used for inter-process communication).

### Code Example

You can see the Inode number of a file using the `-i` flag with `ls`:

```bash
# Create a file
echo "Hello DevOps" > example.txt

# View the Inode number
ls -i example.txt
# Output: 1234567 example.txt (The number is the Inode)

# View detailed metadata using 'stat'
stat example.txt
```

### Explanation

*   **`ls -i`**: Displays the "Index Number" of the file.
*   **`stat`**: This is the most powerful tool for viewing Inode information. It shows the UID, GID, Access times, and the number of links pointing to that Inode.
*   **Inode Exhaustion**: Every filesystem has a fixed number of Inodes. Even if you have 1TB of free space, if you create millions of tiny 1-byte files, you can run out of Inodes, and the system will say "Disk is full" even though there is plenty of storage space left.

### Exercises

1.  **Beginner**: Run `ls -l` on your root directory. Identify one directory, one regular file, and one symbolic link based on the first character of the permissions string.
2.  **Intermediate**: Use the `stat` command on a file. What is the difference between "Access," "Modify," and "Change" times?
3.  **Advanced**: You encounter a server that says "No space left on device," but `df -h` shows the disk is only 50% full. How would you check if the server has run out of Inodes? What command would you use?

## 3. Hard Links vs Symbolic Links

### Concept Explanation

Understanding the difference between Hard Links and Symbolic (Soft) Links is crucial for managing files and space in Linux.

#### Hard Links
*   **A "Twin" Filename**: It's a second name for the *same* Inode.
*   **Shared Data**: If you change the content of a hard link, the original file changes too (because they point to the same physical disk blocks).
*   **Stability**: If you delete the original file, the hard link still works. The data is only deleted when *all* hard links are gone.
*   **Restriction**: You cannot create hard links for directories or across different filesystems (e.g., from Drive A to Drive B).

#### Symbolic Links (Symlinks)
*   **A "Post-it Note"**: It's a small file that simply contains the *path* to another file.
*   **Pointer behavior**: It doesn't point to an Inode; it points to a Filename.
*   **Fragility**: If you delete the original file, the symlink "breaks" (becomes a dangling link) because the name it was looking for is gone.
*   **Flexibility**: You can create symlinks for directories and across different filesystems.

### Code Example

```bash
# Create a file
echo "Original Content" > source.txt

# Create a Hard Link
ln source.txt hardlink.txt

# Create a Symbolic Link
ln -s source.txt symlink.txt

# Check Inodes
ls -i source.txt hardlink.txt symlink.txt
# Notice source and hardlink have the SAME Inode. symlink has a DIFFERENT Inode.
```

### Step-by-Step Walkthrough

1.  **`echo ... > source.txt`**: We create a simple text file with data.
2.  **`ln source.txt hardlink.txt`**: We create a **Hard Link**. Look at the Inode number in Step 4—it's the same as `source.txt`. They are the same file with two different names.
3.  **`ln -s source.txt symlink.txt`**: We create a **Symbolic Link**. This is a tiny file containing the text string `source.txt`.
4.  **`ls -i`**: This is the "Truth Teller." It shows that the hard link is the exact same data on disk (same Inode), while the symlink is a separate file (different Inode).

### Real World Usage

In **DevOps and Software Deployment**, we often use symlinks for "Zero Downtime Deployments." We might have a folder called `app_v1` and `app_v2`. We create a symlink called `current` that points to `app_v1`. To deploy the new version, we simply update the `current` symlink to point to `app_v2`. The application reading from `/path/to/current` never has to stop.

### Best Practices

1.  **Use Symlinks for Versioning**: As mentioned above, symlinks are the standard way to handle application versioning and rollbacks in production.
2.  **Avoid Deep Nesting**: Try to keep your important files in the standard FHS locations (like `/etc` or `/var`). Deeply nested paths (e.g., `/a/b/c/d/e/file.txt`) are hard to manage and monitor.
3.  **Monitor Inodes**: Don't just watch your disk size (`df -h`); also watch your Inode usage (`df -i`). Running out of Inodes is just as bad as running out of GBs.

### Common Mistakes

*   **Deleting the "Original" of a Symlink**: If you delete the target, the symlink survives but becomes "Dangling" or "Broken." Trying to read it will cause an error.
*   **Expecting Hard Links across Drives**: You cannot create a hard link from `/dev/sda` (one disk) to `/dev/sdb` (another disk). You must use a Symlink for this.
*   **Misunderstanding `/tmp`**: Beginner admins often keep important logs in `/tmp`. Remember: many Linux distros delete everything in `/tmp` on every reboot!

### Exercises

1.  **Beginner**: Create a file and a symlink to it. Move the original file to a different directory. Does the symlink still work?
2.  **Intermediate**: How can you tell if a file is a symlink just by looking at the output of `ls -l`? (Hint: look at the permissions string).
3.  **Advanced**: Why does Linux forbid creating hard links for directories? (Think about infinite loops in a tree structure).

## Mini Projects

## Mini Projects

### Beginner: Visualize the filesystem tree

**Problem**: You want to understand the hierarchy of your server visually.
**Task**: Install the `tree` utility. Run `tree -L 2 /` to see the first two levels of the root directory.
**Deliverable**: An ASCII tree output showing the major directories (`/etc`, `/bin`, `/var`, etc.) and their first-level subdirectories.

### Intermediate: Recover a "deleted" file using Inodes

**Problem**: You accidentally ran `rm file.txt`, but a long-running process still has that file open.
**Task**: Use `lsof` (List Open Files) to find the PID of the process and the file descriptor. Navigate to `/proc/[PID]/fd/` to find the link to the file. Copy it to a new location.
**Deliverable**: The original content of the deleted file recovered from the `/proc` filesystem.

### Advanced: Create and mount a custom filesystem image

**Problem**: You need a dedicated, encrypted, or specialized thin-provisioned storage area for an application.
**Task**: Create a 100MB empty file using `dd`. Format it with the `ext4` filesystem using `mkfs.ext4`. Create a mount point and mount this file as a loop device.
**Deliverable**: The output of `df -h` showing your new 100MB filesystem mounted and ready for use.
