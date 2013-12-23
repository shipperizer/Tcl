#!/bin/sh

export HOME_PATH=/home/$USER
export DEPLOY_html=$HOME_PATH/cvs_src/work/training/admin/html/training/cheat/
export DEPLOY_tcl=$HOME_PATH/cvs_src/work/training/admin/tcl/training/cheat/


echo "Copying files"
echo "cp $HOME_PATH/Tcl/tcl/* $DEPLOY_tcl"
echo "cp $HOME_PATH/Tcl/html/* $DEPLOY_html"
cp $HOME_PATH/Tcl/tcl/* $DEPLOY_tcl
cp $HOME_PATH/Tcl/html/* $DEPLOY_html

echo "Launching appserv"
echo "appserv $HOME_PATH/cvs_src/work/training/admin/admin_local_$USER.cfg "
appserv $HOME_PATH/cvs_src/work/training/admin/admin_local_$USER.cfg 
