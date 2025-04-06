#!/bin/bash

LOG_FILE="backend/access.log"

echo "Analyzing log file: $LOG_FILE"

# Checking here if log file exists
if [[ ! -f "$LOG_FILE" ]]; then
    echo "Error: Log file not found!"
    exit 1
fi

# Counting total number of requests per IP:
echo "Total requests per IP:"
awk '{print $3}' $LOG_FILE | sort | uniq -c | sort -nr

# Displaying top 3 IPs
echo -e "\nTop 3 IP addresses with most requests:"
awk '{print $3}' $LOG_FILE | sort | uniq -c | sort -nr | head -3
