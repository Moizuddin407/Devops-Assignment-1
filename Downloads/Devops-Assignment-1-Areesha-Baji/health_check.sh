#!/bin/bash

LOG_FILE="health_check.log"
CONTAINER_NAME="mystifying_taussig"

echo "Checking if the $CONTAINER_NAME is running currently..."

if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "$(date): $CONTAINER_NAME is DOWN. Restarting..." | tee -a $LOG_FILE
    docker start $CONTAINER_NAME
    echo "$(date): $CONTAINER_NAME has been restarted." | tee -a $LOG_FILE
else
    echo "$(date): $CONTAINER_NAME is running fine." | tee -a $LOG_FILE
fi

# ---------------- AUTOMATIC HEALTH CHECK (OPTIONAL) ----------------
# To automatically check & restart every 5 minutes, add this script to `cron`.
# Uncomment the below command and add it to `crontab -e`:
#
# */5 * * * * /path/to/health_check.sh
#

# ------------------------------------------------------------------
