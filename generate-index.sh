#!/bin/bash
posts=`find posts | grep .md | sort -nr`
sed -i ""  '15,$d'  README.md
echo '| Post | Year |' >> README.md
echo '| -----| -----|' >> README.md
for post in $posts
do
  file_name=${post##*/}
  name_with_ext=${file_name#*-}
  name=${name_with_ext%%.*}
  year_and_name=${post#*/}
  year=${year_and_name%/*}
  year=${year%/*} # remove 2020/1203-design-patterns -> 2020
  echo "|[${name}](${post})| ${year}|" >> README.md
done