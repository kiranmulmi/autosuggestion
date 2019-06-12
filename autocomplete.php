<?php $data = '%5B%7B%22key%22%3A%22NP%22%2C%22value%22%3A%22Nepal%22%7D%2C%7B%22key%22%3A%22IND%22%2C%22value%22%3A%22India%22%7D%5D'; ?>
<link rel="stylesheet" href="css/km-autocomplete.1.0.0.css">
<p>ABC</p>
<p>ABC</p>
<p>ABC</p>
<div id="autocomplete" style="margin-left: 200px" ac-default="<?php echo $data ?>"></div>
<p>ABC</p>
<p>ABC</p>
<p>ABC</p>
<p>ABC</p>
<p>ABC</p>
<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
<script src="js/km-autocomplete-1.0.0.js"></script>
<script>
  $(function () {
    $('#autocomplete').kmAutoComplete({
      url: '/json/autocomplete/data.php',
      //placeholder:'Search..',
      externalOption: true,
      tagAddBefore:function(result){
        return result.value;
      },
      searchResultBefore:function(result){
        return '<div class="kiran">'+result.value+'</div>';
      },
      vars: function (vars) {
        console.log(vars);
      },
      isTag: true
      //data: '%5B%7B%22key%22%3A%22NP%22%2C%22value%22%3A%22Nepal%22%7D%2C%7B%22key%22%3A%22IND%22%2C%22value%22%3A%22India%22%7D%2C%7B%22key%22%3A%22US%22%2C%22value%22%3A%22USA%22%7D%5D'
    });
  });
</script>