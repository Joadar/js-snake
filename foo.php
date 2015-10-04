<?php
	//$fp = fopen('files/classement.txt', 'w');
	$fp = "files/classement.txt";
	$current = file_get_contents($fp);
	$current .= $_POST['name']."|".$_POST['points'].PHP_EOL; 
	//fwrite($fp, $current);
	file_put_contents($fp, $current);
	fclose($fp);

?>
