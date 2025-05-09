#!/bin/bash

# Check if jq exist to get json response
if ! type jq > /dev/null; then
  echo "Install jq to get json response"
  sudo apt install jq -y
fi

# Comment block in READEME.md to insert the quotes
START="<!-- START_QUOTE -->"
END="<!-- END_QUOTE -->"
# Print content between two blocks
# sed -n '/'"$START"'/,/'"$END"'/{//!p}' README.md
# sed -n '/START_QUOTE/,/END_QUOTE/{//!p}' README.md

# Get random quotes from https://github.com/hiteshchoudhary/apihub
QUOTABLE=$( curl -s -X GET -H "Content-Type: application/json" https://florinbobis-quotes-net.hf.space/quotes/random?dataset=all | jq -r '.' )
CONTENT=$( echo $QUOTABLE | jq -r '.quoteText' )  
AUTHOR=$( echo $QUOTABLE | jq -r '.author' ) 
DISPLAY=' \
  > “'"$CONTENT"'” \
  > \
  > *- '"$AUTHOR"' -*\n'

# sed multiline replacement between 2 patterns https://fahdshariff.blogspot.com/2012/12/sed-mutli-line-replacement-between-two.html
sed -n -e '/START_QUOTE/{           # when "START_QUOTE" is found
            p                       # print the first comment block
            :a                      # create a label "a"
            N                       # store the next line
            /END_QUOTE/!ba          # goto "a" and keep looping and storing lines until "END_QUOTE" is found
           # N                      # store the line containing "END_QUOTE"
            s/.*\n/'"$DISPLAY"'\n/  # replace the content
        }
        p' -i README.md             # print

# one line version
# sed -n -e '/START_QUOTE/{p;:a;N;/END_QUOTE/!ba;s/.*\n/'"$DISPLAY"'\n/};p' -i README.md

# Check if cowsay exist to generate ASCII art
if ! type cowsay > /dev/null; then
  echo "Install cowsay to generate ASCII art"
  sudo apt install cowsay -y
fi

# Generate ASCII art from https://docs.zenquotes.io/how-to-build-a-zenquotes-api-powered-ascii-art-generator-using-terminal-commands/
echo $'```\n'"$(echo $QUOTABLE | jq -r '" " as $space | .quoteText + "\n\n\($space * ((.quoteText |length)-(.author |length) - 2))--" + .author' | 
      cowsay -nsf $(cowsay -l | tail -n +2 | tr ' ' '\n' | shuf -n1))"$'\n```' >> ../assets/cowsay_quotes.md
