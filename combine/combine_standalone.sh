cd ..

: -------------------- index --------------------
echo -e "<!DOCTYPE html>\n\n<html>\n\t<head>\n\t\t<script type=\"text/javascript\" >" > ./bin/TestRunner.html

: -------------------- Testing --------------------

while read line
do
	cat $line >> ./bin/TestRunner.html
	echo -e "\n" >> ./bin/TestRunner.html	
done < ./combine/files_testRunner.txt

while read line
do
	echo -e $line >> ./bin/TestRunner.html
done < ./combine/testRunnerCode.txt

echo -e '</script><body>\n\t</body>\n</html>' >> ./bin/TestRunner.html