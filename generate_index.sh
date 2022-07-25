#!/bin/bash

# we can execute command in $() or `` 

posts=`find posts | grep .md | sort -nr`
# echo $posts


sed -i ""  '15,$d'  README.md
echo '| Post | Year |' >> README.md
echo '| -----| -----|' >> README.md
for post in $posts
do
  full_name=${post##*/}
  name=${full_name#*-}
  year_and_name=${post#*/}
  year=${year_and_name%/*}
  year=${year%/*} # remove 2020/1203-design-patterns -> 2020
  echo "|[${name}](${post})| ${year}|" >> README.md
done